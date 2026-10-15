import type { D1Database } from '@cloudflare/workers-types'

// HTML + plain-text welcome email with the 10% code, sent right after registration (server/api/auth/register.post.ts).
// Email clients ignore <style> and modern CSS, so it's tables and inline styles, in the site's colors.
// Fraunces/Sora load only where web fonts work (Apple Mail, iOS); Gmail and Outlook show the fallbacks.
// Images are PNG/JPG (no SVG in Gmail/Outlook) from public/email, at 2x the size they're shown.

export interface WelcomeProduct {
  name: string
  slug: string
  description: string
  // as stored: a site path (/assets/...) or a full URL
  image: string
  // RSD
  price: number
  rating: number
  ratingCount: number
}

export interface Welcome {
  code: string
  percent: number
  // already formatted, e.g. "14.11.2026."
  validUntil: string
  // null = the featured product isn't available, the block is left out
  product: WelcomeProduct | null
  unsubscribeUrl: string
}

const COLOR = { ink: '#1b1b1b', beige: '#e8e2d0', sun: '#ffc30b', forest: '#2d3a1f', line: '#e3d6b8', muted: '#6b6560', star: '#d9d3c4', white: '#ffffff', page: '#f4f1ea' }
// The same light design in dark mode: "light only" keeps Apple Mail, iOS Mail and Outlook for Mac from
// recoloring it; Outlook.com recolors anyway and marks what it changed with data-ogsc (text) / data-ogsb
// (background), so the c-* / bg-* classes put the original colors back. The Gmail apps (Android, iOS) recolor
// on their own, ignore all of this, and can't be stopped; they keep the email readable, just darker.
const DARK_MODE_STYLE = `<style>
:root{color-scheme:light only;supported-color-schemes:light only}
${(['page', 'white', 'beige', 'forest', 'ink', 'sun'] as const).map(c => `[data-ogsb] .bg-${c}{background-color:${COLOR[c]}!important}`).join('\n')}
${(['ink', 'forest', 'muted', 'white', 'sun', 'star'] as const).map(c => `[data-ogsc] .c-${c}{color:${COLOR[c]}!important}`).join('\n')}
</style>`
const SERIF = `font-family:Fraunces,Georgia,'Times New Roman',serif;`
const SANS = `font-family:Sora,Arial,Helvetica,sans-serif;`

// TODO: real profile URLs (also placeholders in app/data/footer.ts, see PLAN.md)
const SOCIALS = [
  { label: 'Facebook', icon: 'facebook', href: 'https://facebook.com' },
  { label: 'Instagram', icon: 'instagram', href: 'https://instagram.com' },
  { label: 'TikTok', icon: 'tiktok', href: 'https://tiktok.com' },
]

const SUBJECT = 'Dobrodošli u Libra Herbal: poklon od 10% za Vas'

function escape(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function absolute(siteUrl: string, path: string) {
  return /^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

// 1 recenzija, 2–4 recenzije, 5+ recenzija (11–14 too)
function reviewsWord(count: number) {
  const tens = count % 100
  return count % 10 >= 2 && count % 10 <= 4 && (tens < 12 || tens > 14) ? 'recenzije' : 'recenzija'
}

function button(href: string, label: string, fullWidth = false) {
  return `<a href="${href}" class="bg-sun c-ink" style="display:${fullWidth ? 'block' : 'inline-block'};background:${COLOR.sun};color:${COLOR.ink};${SANS}font-size:14px;line-height:20px;font-weight:bold;letter-spacing:0.5px;text-align:center;text-decoration:none;padding:12px 24px;border-radius:6px;">${label}</a>`
}

function productBlock(product: WelcomeProduct, siteUrl: string) {
  const url = `${siteUrl}/proizvodi/${product.slug}`
  const full = Math.round(product.rating)
  const stars = `<span class="c-sun" style="color:${COLOR.sun};">${'★'.repeat(full)}</span><span class="c-star" style="color:${COLOR.star};">${'★'.repeat(5 - full)}</span>`
  const rating = product.ratingCount
    ? `<div style="${SANS}font-size:14px;line-height:16px;letter-spacing:1px;">${stars}</div>
       <div class="c-muted" style="${SANS}font-size:11px;line-height:16px;color:${COLOR.muted};padding-top:2px;">${product.rating.toFixed(1).replace('.', ',')} · ${product.ratingCount} ${reviewsWord(product.ratingCount)}</div>`
    : ''

  // two columns that stack on phones without media queries (Gmail app); Outlook gets a real table
  return `
    <tr><td style="padding:32px 32px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid ${COLOR.line};font-size:0;line-height:0;">&nbsp;</td></tr></table>
    </td></tr>
    <tr><td align="center" style="padding:24px 22px 0;font-size:0;">
      <!--[if mso]><table role="presentation" width="556" cellpadding="0" cellspacing="0"><tr><td width="288" valign="top"><![endif]-->
      <div style="display:inline-block;width:100%;max-width:288px;vertical-align:top;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:0 10px 16px;text-align:left;">
          <a href="${url}" class="c-forest" style="${SERIF}font-size:26px;line-height:32px;font-weight:600;color:${COLOR.forest};text-decoration:none;">${escape(product.name)}</a>
          ${rating}
          <div class="c-ink" style="${SANS}font-size:13px;line-height:20px;color:${COLOR.ink};padding-top:16px;">${escape(product.description)}</div>
          <div class="c-ink" style="${SANS}font-size:24px;line-height:30px;font-weight:bold;color:${COLOR.ink};padding-top:16px;">${product.price},00 <span style="font-size:14px;">RSD</span></div>
        </td></tr></table>
      </div>
      <!--[if mso]></td><td width="268" valign="top"><![endif]-->
      <div style="display:inline-block;width:100%;max-width:268px;vertical-align:top;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:0 10px 16px;">
          <a href="${url}"><img src="${escape(absolute(siteUrl, product.image))}" width="248" alt="${escape(product.name)}" style="display:block;width:100%;max-width:248px;height:auto;border-radius:12px;background:${COLOR.beige};border:0;"></a>
        </td></tr></table>
      </div>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
    <tr><td style="padding:8px 32px 0;">${button(url, 'PORUČITE ODMAH&nbsp;&nbsp;→', true)}</td></tr>`
}

export function welcomeEmail(welcome: Welcome, siteUrl: string) {
  const shopUrl = `${siteUrl}/proizvodi`
  const img = (name: string) => `${siteUrl}/email/${name}.png`
  const link = `class="c-white" style="color:${COLOR.white};text-decoration:underline;"`

  const socials = SOCIALS.map(s =>
    `<a href="${s.href}" style="text-decoration:none;"><img src="${img(s.icon)}" width="20" height="20" alt="${s.label}" style="display:inline-block;width:20px;height:20px;border:0;vertical-align:middle;"></a>`,
  ).join(`<span class="c-white" style="color:${COLOR.white};padding:0 10px;vertical-align:middle;">|</span>`)

  const html = `<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${SUBJECT}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Sora:wght@400;700&display=swap" rel="stylesheet">
${DARK_MODE_STYLE}
</head>
<body class="bg-page" style="margin:0;padding:0;background:${COLOR.page};">
  <div style="display:none;max-height:0;overflow:hidden;">Hvala što ste se registrovali. Vaš kod za ${welcome.percent}% popusta je unutra.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-page" style="background:${COLOR.page};">
    <tr><td align="center" style="padding:24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-white" style="max-width:600px;background:${COLOR.white};">

        <tr><td align="center" class="bg-forest" style="background:${COLOR.forest};padding:14px 24px;">
          <a href="${siteUrl}"><img src="${img('logo')}" width="88" height="33" alt="Libra Herbal" style="display:block;width:88px;height:33px;border:0;"></a>
        </td></tr>

        <tr><td align="center" class="bg-beige" style="background:${COLOR.beige};padding:32px 32px 36px;">
          <div class="c-muted" style="${SANS}font-size:10px;line-height:14px;letter-spacing:1.5px;color:${COLOR.muted};">SAMO ZA VAS</div>
          <div class="c-forest" style="${SERIF}font-size:30px;line-height:38px;font-weight:600;color:${COLOR.forest};padding-top:4px;">Poklon dobrodošlice</div>
          <img src="${img('gift')}" width="96" height="96" alt="" style="display:block;width:96px;height:96px;border:0;margin:20px auto;">
          <div class="c-ink" style="${SANS}font-size:13px;line-height:20px;color:${COLOR.ink};max-width:440px;">
            Hvala Vam što ste se registrovali i napravili korak više ka zdravijoj svakodnevici.
            Želimo Vam srdačnu dobrodošlicu, a tim povodom smo Vam spremili mali poklon.
          </div>
        </td></tr>

        <tr><td align="center" style="padding:40px 32px 0;">
          <div class="c-forest" style="${SERIF}font-size:26px;line-height:32px;font-weight:600;color:${COLOR.forest};">${welcome.percent}% popusta na sledeću porudžbinu</div>
          <div class="c-ink" style="${SANS}font-size:13px;line-height:20px;color:${COLOR.ink};padding-top:6px;">Unesite kod prilikom plaćanja i ostvarite ${welcome.percent}% popusta</div>
        </td></tr>
        <tr><td align="center" style="padding:24px 32px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td class="bg-ink c-white" style="background:${COLOR.ink};border:2px dashed ${COLOR.sun};border-radius:6px;padding:12px 24px;${SANS}font-size:24px;line-height:30px;font-weight:bold;letter-spacing:3px;color:${COLOR.white};">${escape(welcome.code)}</td>
          </tr></table>
          <div class="c-muted" style="${SANS}font-size:11px;line-height:16px;color:${COLOR.muted};padding-top:8px;">Kod važi do ${welcome.validUntil} i može se iskoristiti jednom.</div>
        </td></tr>
        <tr><td align="center" style="padding:20px 32px 0;">${button(shopUrl, 'POGLEDAJTE PRODAVNICU')}</td></tr>

        ${welcome.product ? productBlock(welcome.product, siteUrl) : ''}

        <tr><td style="padding:40px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>

        <tr><td align="center" class="bg-forest c-white" style="background:${COLOR.forest};padding:40px 32px;${SANS}font-size:13px;line-height:20px;color:${COLOR.white};">
          <a href="${siteUrl}"><img src="${img('logo')}" width="120" height="45" alt="Libra Herbal" style="display:block;width:120px;height:45px;border:0;margin:0 auto;"></a>
          <div style="font-weight:bold;padding-top:28px;">Zapratite nas:<br>@libraherbal.rs</div>
          <div style="padding-top:12px;">${socials}</div>
          <div style="padding-top:28px;">
            Ukoliko ne želite da primate naše podsetnike i ponude, odjavite se klikom na <a href="${escape(welcome.unsubscribeUrl)}" ${link}>ovaj link</a>.
          </div>
          <div style="padding-top:8px;">
            <a href="${siteUrl}/politika-privatnosti" ${link}>Zaštita podataka</a>
            <span style="padding:0 8px;">|</span>
            <a href="${siteUrl}/uslovi-koriscenja" ${link}>Uslovi korišćenja</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const product = welcome.product
  const text = [
    'Poklon dobrodošlice',
    '',
    'Hvala Vam što ste se registrovali i napravili korak više ka zdravijoj svakodnevici. Želimo Vam srdačnu dobrodošlicu, a tim povodom smo Vam spremili mali poklon.',
    '',
    `${welcome.percent}% popusta na sledeću porudžbinu. Unesite kod prilikom plaćanja:`,
    '',
    welcome.code,
    '',
    `Kod važi do ${welcome.validUntil} i može se iskoristiti jednom.`,
    `Pogledajte prodavnicu: ${shopUrl}`,
    ...(product ? ['', `${product.name}, ${product.price},00 RSD`, product.description, `Poručite odmah: ${siteUrl}/proizvodi/${product.slug}`] : []),
    '',
    `Zaštita podataka: ${siteUrl}/politika-privatnosti`,
    `Uslovi korišćenja: ${siteUrl}/uslovi-koriscenja`,
    `Odjava od podsetnika i ponuda: ${welcome.unsubscribeUrl}`,
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
