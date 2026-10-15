import type { D1Database } from '@cloudflare/workers-types'
import type { ReminderProduct } from '../../utils/reminderEmails'

// Hourly (scheduledTasks in nuxt.config.ts + triggers.crons in wrangler.jsonc): reminder emails to
// registered users who didn't unsubscribe. Each run:
//  1. abandoned cart: cart last changed 2–48 h ago, no order since, no cart reminder since that change
//     and none in the last 7 days
//  2. viewed products: last view 2–24 h ago, no cart changed in the last 48 h (that one gets the cart
//     reminder instead), no order in the last 24 h, no browse reminder in the last 14 days;
//     up to 3 most recently viewed products that aren't in the cart
//  Both: no reminder of any kind in the last 3 days. Carts go first, so they win the 3-day slot.
//  3. housekeeping: views older than 30 days, send log older than 90 days
// Every query starts from an index on a time column, so a run reads only recent rows.
// The send log is written only after Resend accepted the batch; a failed run is simply retried next hour.

// keeps one run within one Resend batch (100) and well under Resend's free daily limit
const MAX_PER_KIND = 50
const MAX_BROWSE_PRODUCTS = 3

interface Recipient {
  id: number
  email: string
  unsubscribe_token: string | null
}

interface ProductRow {
  owner: number
  name: string
  slug: string
  description: string | null
  primary_image: string | null
  final_price: number
  rating_avg: number
  rating_count: number
  quantity?: number
}

// p = v_product_card, d = products (the view has no description)
const PRODUCT_COLUMNS = 'p.name, p.slug, d.description, p.primary_image, p.final_price, p.rating_avg, p.rating_count'

const NO_RECENT_REMINDER = `
  NOT EXISTS (SELECT 1 FROM email_sends s WHERE s.user_id = u.id AND s.sent_at > datetime('now', '-3 days'))`

export default defineTask({
  meta: {
    name: 'emails:reminders',
    description: 'Abandoned-cart and viewed-product reminder emails',
  },
  async run() {
    const db = useDb()
    const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

    const cart = await cartReminders(db, siteUrl)
    const browse = await browseReminders(db, siteUrl)
    await db.batch([
      db.prepare(`DELETE FROM product_views WHERE viewed_at < datetime('now', '-30 days')`),
      db.prepare(`DELETE FROM email_sends WHERE sent_at < datetime('now', '-90 days')`),
    ])
    return { result: { cart, browse } }
  },
})

async function cartReminders(db: D1Database, siteUrl: string) {
  const { results: recipients } = await db.prepare(`
    SELECT u.id, u.email, u.unsubscribe_token, c.id AS cart_id
    FROM carts c JOIN users u ON u.id = c.user_id
    WHERE c.updated_at <= datetime('now', '-2 hours') AND c.updated_at > datetime('now', '-48 hours')
      AND u.reminder_emails = 1
      AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.received_at >= c.updated_at)
      AND NOT EXISTS (
        SELECT 1 FROM email_sends s WHERE s.user_id = u.id AND s.kind = 'cart'
          AND (s.sent_at >= c.updated_at OR s.sent_at > datetime('now', '-7 days'))
      )
      AND ${NO_RECENT_REMINDER}
    ORDER BY c.updated_at
    LIMIT ${MAX_PER_KIND}
  `).all<Recipient & { cart_id: number }>()
  if (!recipients.length) return 0

  const owners = new Map(recipients.map(r => [r.cart_id, r.id]))
  const { results: rows } = await db.prepare(`
    SELECT i.cart_id AS owner, ${PRODUCT_COLUMNS}, i.quantity
    FROM cart_items i JOIN v_product_card p ON p.id = i.product_id JOIN products d ON d.id = p.id
    WHERE i.cart_id IN (${placeholders(recipients.length)}) AND p.final_price IS NOT NULL
    ORDER BY i.created_at, i.product_id
  `).bind(...recipients.map(r => r.cart_id)).all<ProductRow>()

  // cart id → user id, so products group by user like in browseReminders
  const products = groupProducts(rows.map(row => ({ ...row, owner: owners.get(row.owner)! })))
  return await send(db, siteUrl, 'cart', recipients, products)
}

async function browseReminders(db: D1Database, siteUrl: string) {
  const { results: recipients } = await db.prepare(`
    SELECT u.id, u.email, u.unsubscribe_token
    FROM users u
    WHERE u.id IN (
        SELECT v.user_id FROM product_views v
        WHERE v.viewed_at > datetime('now', '-24 hours')
        GROUP BY v.user_id
        HAVING MAX(v.viewed_at) <= datetime('now', '-2 hours')
      )
      AND u.reminder_emails = 1
      AND NOT EXISTS (SELECT 1 FROM carts c WHERE c.user_id = u.id AND c.updated_at > datetime('now', '-48 hours'))
      AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.received_at > datetime('now', '-24 hours'))
      AND NOT EXISTS (
        SELECT 1 FROM email_sends s WHERE s.user_id = u.id AND s.kind = 'browse' AND s.sent_at > datetime('now', '-14 days')
      )
      AND ${NO_RECENT_REMINDER}
    LIMIT ${MAX_PER_KIND}
  `).all<Recipient>()
  if (!recipients.length) return 0

  const { results: rows } = await db.prepare(`
    SELECT v.user_id AS owner, ${PRODUCT_COLUMNS}
    FROM product_views v JOIN v_product_card p ON p.id = v.product_id JOIN products d ON d.id = p.id
    WHERE v.user_id IN (${placeholders(recipients.length)})
      AND v.viewed_at > datetime('now', '-24 hours')
      AND p.final_price IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM carts c JOIN cart_items i ON i.cart_id = c.id WHERE c.user_id = v.user_id AND i.product_id = v.product_id
      )
    ORDER BY v.viewed_at DESC
  `).bind(...recipients.map(r => r.id)).all<ProductRow>()

  const products = groupProducts(rows)
  for (const [owner, list] of products) products.set(owner, list.slice(0, MAX_BROWSE_PRODUCTS))
  return await send(db, siteUrl, 'browse', recipients, products)
}

async function send(db: D1Database, siteUrl: string, kind: 'cart' | 'browse', recipients: Recipient[], products: Map<number, ReminderProduct[]>) {
  // nothing left to show (products deactivated, already in the cart) = no email
  const due = recipients.filter(r => products.get(r.id)?.length)
  if (!due.length) return 0

  // the unsubscribe link must work before the email arrives
  const newTokens = due.filter(r => !r.unsubscribe_token).map((r) => {
    r.unsubscribe_token = toHex(crypto.getRandomValues(new Uint8Array(32)))
    return db.prepare('UPDATE users SET unsubscribe_token = ?2 WHERE id = ?1 AND unsubscribe_token IS NULL').bind(r.id, r.unsubscribe_token)
  })
  if (newTokens.length) await db.batch(newTokens)

  const ids = await sendEmails(due.map((r) => {
    const unsubscribeUrl = `${siteUrl}/odjava-podsetnika?t=${r.unsubscribe_token}`
    const email = reminderEmail({ kind, products: products.get(r.id)!, unsubscribeUrl }, siteUrl)
    return {
      from: EMAIL_FROM.reminders,
      to: r.email,
      ...email,
      // one-click unsubscribe from the mail app itself (RFC 8058), required by Gmail and Yahoo for bulk senders
      headers: {
        'List-Unsubscribe': `<${siteUrl}/api/email/unsubscribe?t=${r.unsubscribe_token}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }
  }))
  // no API key (local dev): logged, not sent, so not recorded either
  if (!ids) return 0

  await db.batch(due.map((r, i) => db.prepare('INSERT INTO email_sends (user_id, kind, resend_id) VALUES (?1, ?2, ?3)').bind(r.id, kind, ids[i] ?? null)))
  return due.length
}

function groupProducts(rows: ProductRow[]) {
  const grouped = new Map<number, ReminderProduct[]>()
  for (const row of rows) {
    const list = grouped.get(row.owner) ?? []
    // amounts are in para (1 RSD = 100), the email shows RSD
    list.push({
      name: row.name,
      slug: row.slug,
      description: row.description ?? '',
      image: row.primary_image ?? '',
      price: row.final_price / 100,
      rating: row.rating_avg,
      ratingCount: row.rating_count,
      quantity: row.quantity,
    })
    grouped.set(row.owner, list)
  }
  return grouped
}

function placeholders(count: number) {
  return Array.from({ length: count }, (_, i) => `?${i + 1}`).join(', ')
}
