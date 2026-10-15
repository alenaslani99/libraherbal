import type { D1Database } from '@cloudflare/workers-types'
import { type FeaturedProduct, button, COLOR, divider, emailDocument, escapeHtml, hero, productFeature, SANS, SERIF, textFooter } from './emailLayout'

// HTML + plain-text welcome email with the 10% code, sent right after registration (server/api/auth/register.post.ts).
// Header, footer, colors and dark mode come from emailLayout.ts.

export interface Welcome {
  code: string
  percent: number
  // already formatted, e.g. "14.11.2026."
  validUntil: string
  // null = the featured product isn't available, the block is left out
  product: FeaturedProduct | null
  unsubscribeUrl: string
}

const SUBJECT = 'Dobrodošli u Libra Herbal: poklon od 10% za Vas'
const INTRO = 'Hvala Vam što ste se registrovali i napravili korak više ka zdravijoj svakodnevici. Želimo Vam srdačnu dobrodošlicu, a tim povodom smo Vam spremili mali poklon.'

export function welcomeEmail(welcome: Welcome, siteUrl: string) {
  const shopUrl = `${siteUrl}/proizvodi`
  const product = welcome.product

  const rows = `
        ${hero({ siteUrl, icon: 'gift', iconSize: 96, iconBelowHeading: true, eyebrow: 'SAMO ZA VAS', heading: 'Poklon dobrodošlice', text: INTRO })}

        <tr><td align="center" style="padding:40px 32px 0;">
          <div class="c-forest" style="${SERIF}font-size:26px;line-height:32px;font-weight:600;color:${COLOR.forest};">${welcome.percent}% popusta na sledeću porudžbinu</div>
          <div class="c-ink" style="${SANS}font-size:13px;line-height:20px;color:${COLOR.ink};padding-top:6px;">Unesite kod prilikom plaćanja i ostvarite ${welcome.percent}% popusta</div>
        </td></tr>
        <tr><td align="center" style="padding:24px 32px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td class="bg-ink c-white" style="background:${COLOR.ink};border:2px dashed ${COLOR.sun};border-radius:6px;padding:12px 24px;${SANS}font-size:24px;line-height:30px;font-weight:bold;letter-spacing:3px;color:${COLOR.white};">${escapeHtml(welcome.code)}</td>
          </tr></table>
          <div class="c-muted" style="${SANS}font-size:11px;line-height:16px;color:${COLOR.muted};padding-top:8px;">Kod važi do ${welcome.validUntil} i može se iskoristiti jednom.</div>
        </td></tr>
        <tr><td align="center" style="padding:20px 32px 0;">${button(shopUrl, 'POGLEDAJTE PRODAVNICU')}</td></tr>

        ${product ? divider() + productFeature(product, siteUrl) : ''}`

  const html = emailDocument({
    siteUrl,
    title: SUBJECT,
    preheader: `Hvala što ste se registrovali. Vaš kod za ${welcome.percent}% popusta je unutra.`,
    rows,
    unsubscribeUrl: welcome.unsubscribeUrl,
  })

  const text = [
    'Poklon dobrodošlice',
    '',
    INTRO,
    '',
    `${welcome.percent}% popusta na sledeću porudžbinu. Unesite kod prilikom plaćanja:`,
    '',
    welcome.code,
    '',
    `Kod važi do ${welcome.validUntil} i može se iskoristiti jednom.`,
    `Pogledajte prodavnicu: ${shopUrl}`,
    ...(product ? ['', `${product.name}, ${product.price},00 RSD`, product.description, `Poručite odmah: ${siteUrl}/proizvodi/${product.slug}`] : []),
    '',
    ...textFooter(siteUrl, welcome.unsubscribeUrl),
  ].join('\n')

  return { subject: SUBJECT, html, text }
}

const WELCOME_PERCENT = 10
const WELCOME_DAYS = 30
// the product shown in the email; fixed for now, later chosen in the admin
const FEATURED_SLUG = 'bronhi-med'

// dd.mm.yyyy. in Serbian time
function serbianDate(date: Date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Belgrade', day: '2-digit', month: '2-digit', year: 'numeric' })
    .formatToParts(date).map(p => [p.type, p.value]))
  return `${parts.day}.${parts.month}.${parts.year}.`
}

// Creates the user's welcome code and sends it. Recorded in email_sends, so the reminder cron
// also waits its 3 days after it. Without RESEND_API_KEY (local dev) the email is only logged.
export async function sendWelcomeEmail(db: D1Database, user: { id: number, email: string, unsubscribeToken: string }) {
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const code = await createCoupon(db, { kind: 'welcome', percent: WELCOME_PERCENT, userId: user.id, days: WELCOME_DAYS })

  const row = await db.prepare(`
    SELECT v.name, v.slug, p.description, v.primary_image, v.final_price, v.rating_avg, v.rating_count
    FROM v_product_card v JOIN products p ON p.id = v.id
    WHERE v.slug = ?1 AND v.final_price IS NOT NULL
  `).bind(FEATURED_SLUG).first<{ name: string, slug: string, description: string | null, primary_image: string | null, final_price: number, rating_avg: number, rating_count: number }>()

  const email = welcomeEmail({
    code,
    percent: WELCOME_PERCENT,
    validUntil: serbianDate(new Date(Date.now() + WELCOME_DAYS * 24 * 60 * 60 * 1000)),
    // amounts are in para (1 RSD = 100), the email shows RSD
    product: row?.primary_image
      ? { name: row.name, slug: row.slug, description: row.description ?? '', image: row.primary_image, price: row.final_price / 100, rating: row.rating_avg, ratingCount: row.rating_count }
      : null,
    unsubscribeUrl: `${siteUrl}/odjava-podsetnika?t=${user.unsubscribeToken}`,
  }, siteUrl)

  const ids = await sendEmails([{
    from: EMAIL_FROM.welcome,
    to: user.email,
    ...email,
    // one-click unsubscribe from the mail app itself (RFC 8058)
    headers: {
      'List-Unsubscribe': `<${siteUrl}/api/email/unsubscribe?t=${user.unsubscribeToken}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  }])
  if (ids) await db.prepare(`INSERT INTO email_sends (user_id, kind, resend_id) VALUES (?1, 'welcome', ?2)`).bind(user.id, ids[0] ?? null).run()
}
