// Shared look of all emails (welcome, cart and browse reminders): document, header, footer, beige hero,
// product block and button. Email clients ignore modern CSS, so it's tables and inline styles.
// Fraunces/Sora load only where web fonts work (Apple Mail, iOS); Gmail and Outlook show the fallbacks.
// Images are PNG/JPG (no SVG in Gmail/Outlook) from public/email, at 2x the size they're shown.

export const COLOR = { ink: '#1b1b1b', beige: '#e8e2d0', sun: '#ffc30b', forest: '#2d3a1f', line: '#e3d6b8', muted: '#6b6560', star: '#d9d3c4', white: '#ffffff', page: '#f4f1ea' }
export const SERIF = `font-family:Fraunces,Georgia,'Times New Roman',serif;`
export const SANS = `font-family:Sora,Arial,Helvetica,sans-serif;`

// The same light design in dark mode: "light only" keeps Apple Mail, iOS Mail and Outlook for Mac from
// recoloring it; Outlook.com recolors anyway and marks what it changed with data-ogsc (text) / data-ogsb
// (background), so the c-* / bg-* classes put the original colors back. The Gmail apps (Android, iOS) recolor
// on their own, ignore all of this, and can't be stopped; they keep the email readable, just darker.
const DARK_MODE_STYLE = `<style>
:root{color-scheme:light only;supported-color-schemes:light only}
${(['page', 'white', 'beige', 'forest', 'ink', 'sun'] as const).map(c => `[data-ogsb] .bg-${c}{background-color:${COLOR[c]}!important}`).join('\n')}
${(['ink', 'forest', 'muted', 'white', 'sun', 'star'] as const).map(c => `[data-ogsc] .c-${c}{color:${COLOR[c]}!important}`).join('\n')}
</style>`

// TODO: real profile URLs (also placeholders in app/data/footer.ts, see PLAN.md)
const SOCIALS = [
  { label: 'Facebook', icon: 'facebook', href: 'https://facebook.com' },
  { label: 'Instagram', icon: 'instagram', href: 'https://instagram.com' },
  { label: 'TikTok', icon: 'tiktok', href: 'https://tiktok.com' },
]

export function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function absolute(siteUrl: string, path: string) {
  return /^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

// one of public/email/*.png
export function emailImage(siteUrl: string, name: string) {
  return `${siteUrl}/email/${name}.png`
}

export function button(href: string, label: string, fullWidth = false) {
  return `<a href="${href}" class="bg-sun c-ink" style="display:${fullWidth ? 'block' : 'inline-block'};background:${COLOR.sun};color:${COLOR.ink};${SANS}font-size:14px;line-height:20px;font-weight:bold;letter-spacing:0.5px;text-align:center;text-decoration:none;padding:12px 24px;border-radius:6px;">${label}</a>`
}

// a full-width row: a thin line between sections
export function divider(padding = '32px 32px 0') {
  return `<tr><td style="padding:${padding};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid ${COLOR.line};font-size:0;line-height:0;">&nbsp;</td></tr></table>
    </td></tr>`
}

// A full-width row: beige block with an icon (public/email/<icon>.png), small caps line, heading and a
// short text. The icon goes above the lines (reminders) or between the heading and the text (welcome).
export function hero(input: { siteUrl: string, icon: string, iconSize: number, iconBelowHeading?: boolean, eyebrow: string, heading: string, text: string }) {
  const size = input.iconSize
  const icon = `<img src="${emailImage(input.siteUrl, input.icon)}" width="${size}" height="${size}" alt="" style="display:block;width:${size}px;height:${size}px;border:0;margin:${input.iconBelowHeading ? '20px auto' : '0 auto 16px'};">`
  return `<tr><td align="center" class="bg-beige" style="background:${COLOR.beige};padding:32px 32px 36px;">
          ${input.iconBelowHeading ? '' : icon}
          <div class="c-muted" style="${SANS}font-size:10px;line-height:14px;letter-spacing:1.5px;color:${COLOR.muted};">${input.eyebrow}</div>
          <div class="c-forest" style="${SERIF}font-size:30px;line-height:38px;font-weight:600;color:${COLOR.forest};padding-top:4px;">${input.heading}</div>
          ${input.iconBelowHeading ? icon : ''}
          <div class="c-ink" style="${SANS}font-size:13px;line-height:20px;color:${COLOR.ink};max-width:440px;padding-top:${input.iconBelowHeading ? 0 : 12}px;">${input.text}</div>
        </td></tr>`
}

export interface FeaturedProduct {
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

// 1 recenzija, 2–4 recenzije, 5+ recenzija (11–14 too)
function reviewsWord(count: number) {
  const tens = count % 100
  return count % 10 >= 2 && count % 10 <= 4 && (tens < 12 || tens > 14) ? 'recenzije' : 'recenzija'
}

// Rows: the product in two columns (text + photo, or photo + text) and an order button under it.
// The columns stack on phones without media queries (Gmail app); Outlook gets a real table.
export function productFeature(product: FeaturedProduct, siteUrl: string, imageFirst = false) {
  const url = `${siteUrl}/proizvodi/${product.slug}`
  const full = Math.round(product.rating)
  const stars = `<span class="c-sun" style="color:${COLOR.sun};">${'★'.repeat(full)}</span><span class="c-star" style="color:${COLOR.star};">${'★'.repeat(5 - full)}</span>`
  const rating = product.ratingCount
    ? `<div style="${SANS}font-size:14px;line-height:16px;letter-spacing:1px;">${stars}</div>
       <div class="c-muted" style="${SANS}font-size:11px;line-height:16px;color:${COLOR.muted};padding-top:2px;">${product.rating.toFixed(1).replace('.', ',')} · ${product.ratingCount} ${reviewsWord(product.ratingCount)}</div>`
    : ''

  const text = `<div style="display:inline-block;width:100%;max-width:288px;vertical-align:top;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:0 10px 16px;text-align:left;">
          <a href="${url}" class="c-forest" style="${SERIF}font-size:26px;line-height:32px;font-weight:600;color:${COLOR.forest};text-decoration:none;">${escapeHtml(product.name)}</a>
          ${rating}
          <div class="c-ink" style="${SANS}font-size:13px;line-height:20px;color:${COLOR.ink};padding-top:16px;">${escapeHtml(product.description)}</div>
          <div class="c-ink" style="${SANS}font-size:24px;line-height:30px;font-weight:bold;color:${COLOR.ink};padding-top:16px;">${product.price},00 <span style="font-size:14px;">RSD</span></div>
        </td></tr></table>
      </div>`
  const photo = `<div style="display:inline-block;width:100%;max-width:268px;vertical-align:top;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:0 10px 16px;">
          <a href="${url}"><img src="${escapeHtml(absolute(siteUrl, product.image))}" width="248" alt="${escapeHtml(product.name)}" style="display:block;width:100%;max-width:248px;height:auto;border-radius:12px;background:${COLOR.beige};border:0;"></a>
        </td></tr></table>
      </div>`
  const [first, second] = imageFirst ? [photo, text] : [text, photo]
  const [firstWidth, secondWidth] = imageFirst ? [268, 288] : [288, 268]

  return `<tr><td align="center" style="padding:24px 22px 0;font-size:0;">
      <!--[if mso]><table role="presentation" width="556" cellpadding="0" cellspacing="0"><tr><td width="${firstWidth}" valign="top"><![endif]-->
      ${first}
      <!--[if mso]></td><td width="${secondWidth}" valign="top"><![endif]-->
      ${second}
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
    <tr><td style="padding:8px 32px 0;">${button(url, 'PORUČITE ODMAH&nbsp;&nbsp;→', true)}</td></tr>`
}

// The whole email around `rows` (<tr>s of the white column): forest header with the logo, footer with
// socials, unsubscribe and legal links.
export function emailDocument(input: { siteUrl: string, title: string, preheader: string, rows: string, unsubscribeUrl: string }) {
  const { siteUrl } = input
  const link = `class="c-white" style="color:${COLOR.white};text-decoration:underline;"`
  const socials = SOCIALS.map(s =>
    `<a href="${s.href}" style="text-decoration:none;"><img src="${emailImage(siteUrl, s.icon)}" width="20" height="20" alt="${s.label}" style="display:inline-block;width:20px;height:20px;border:0;vertical-align:middle;"></a>`,
  ).join(`<span class="c-white" style="color:${COLOR.white};padding:0 10px;vertical-align:middle;">|</span>`)

  return `<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(input.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Sora:wght@400;700&display=swap" rel="stylesheet">
${DARK_MODE_STYLE}
</head>
<body class="bg-page" style="margin:0;padding:0;background:${COLOR.page};">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(input.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-page" style="background:${COLOR.page};">
    <tr><td align="center" style="padding:24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg-white" style="max-width:600px;background:${COLOR.white};">

        <tr><td align="center" class="bg-forest" style="background:${COLOR.forest};padding:14px 24px;">
          <a href="${siteUrl}"><img src="${emailImage(siteUrl, 'logo')}" width="88" height="33" alt="Libra Herbal" style="display:block;width:88px;height:33px;border:0;"></a>
        </td></tr>

        ${input.rows}

        <tr><td style="padding:40px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>

        <tr><td align="center" class="bg-forest c-white" style="background:${COLOR.forest};padding:40px 32px;${SANS}font-size:13px;line-height:20px;color:${COLOR.white};">
          <a href="${siteUrl}"><img src="${emailImage(siteUrl, 'logo')}" width="120" height="45" alt="Libra Herbal" style="display:block;width:120px;height:45px;border:0;margin:0 auto;"></a>
          <div style="font-weight:bold;padding-top:28px;">Zapratite nas:<br>@libraherbal.rs</div>
          <div style="padding-top:12px;">${socials}</div>
          <div style="padding-top:28px;">
            Ukoliko ne želite da primate naše podsetnike i ponude, odjavite se klikom na <a href="${escapeHtml(input.unsubscribeUrl)}" ${link}>ovaj link</a>.
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
}

// the footer of the plain-text version
export function textFooter(siteUrl: string, unsubscribeUrl: string) {
  return [
    `Zaštita podataka: ${siteUrl}/politika-privatnosti`,
    `Uslovi korišćenja: ${siteUrl}/uslovi-koriscenja`,
    `Odjava od podsetnika i ponuda: ${unsubscribeUrl}`,
  ]
}
