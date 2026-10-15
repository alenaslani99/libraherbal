import type { D1Database } from '@cloudflare/workers-types'
import { type FeaturedProduct, couponRows, divider, emailDocument, hero, productFeature, textFooter } from './emailLayout'
import { couponValidUntil, loadFeaturedProduct } from './emailData'

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
  const product = welcome.product

  const rows = `
        ${hero({ siteUrl, icon: 'gift', iconSize: 96, iconAt: 'afterHeading', eyebrow: 'SAMO ZA VAS', heading: 'Poklon dobrodošlice', text: INTRO })}
        ${couponRows({
          siteUrl,
          heading: `${welcome.percent}% popusta na sledeću porudžbinu`,
          text: `Unesite kod prilikom plaćanja i ostvarite ${welcome.percent}% popusta`,
          code: welcome.code,
          validUntil: welcome.validUntil,
        })}
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
    `Pogledajte prodavnicu: ${siteUrl}/proizvodi`,
    ...(product ? ['', `${product.name}, ${product.price},00 RSD`, product.description, `Poručite odmah: ${siteUrl}/proizvodi/${product.slug}`] : []),
    '',
    ...textFooter(siteUrl, welcome.unsubscribeUrl),
  ].join('\n')

  return { subject: SUBJECT, html, text }
}

const WELCOME_PERCENT = 10
const WELCOME_DAYS = 30

// Creates the user's welcome code and sends it. Recorded in email_sends, so the reminder cron
// also waits its 3 days after it. Without RESEND_API_KEY (local dev) the email is only logged.
export async function sendWelcomeEmail(db: D1Database, user: { id: number, email: string, unsubscribeToken: string }) {
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const code = await createCoupon(db, { kind: 'welcome', percent: WELCOME_PERCENT, userId: user.id, days: WELCOME_DAYS })

  const email = welcomeEmail({
    code,
    percent: WELCOME_PERCENT,
    validUntil: couponValidUntil(WELCOME_DAYS),
    product: await loadFeaturedProduct(db),
    unsubscribeUrl: `${siteUrl}/odjava-podsetnika?t=${user.unsubscribeToken}`,
  }, siteUrl)

  const ids = await sendEmails([{
    from: EMAIL_FROM.welcome,
    to: user.email,
    ...email,
    headers: unsubscribeHeaders(siteUrl, user.unsubscribeToken),
  }])
  if (ids) await db.prepare(`INSERT INTO email_sends (user_id, kind, resend_id) VALUES (?1, 'welcome', ?2)`).bind(user.id, ids[0] ?? null).run()
}
