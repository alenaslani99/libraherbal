// HTML + plain-text reminder emails (abandoned cart, viewed products), sent by server/tasks/emails/reminders.ts.
// Email clients ignore <style> and modern CSS, so it's tables and inline styles, in the site's colors.

export interface ReminderProduct {
  name: string
  slug: string
  // as stored: a site path (/assets/...) or a full URL
  image: string
  // RSD
  price: number
  // cart only
  quantity?: number
}

export interface Reminder {
  kind: 'cart' | 'browse'
  firstName: string
  products: ReminderProduct[]
  unsubscribeUrl: string
}

const COLOR = { ink: '#1b1b1b', beige: '#e8e2d0', sun: '#ffc30b', forest: '#2d3a1f', muted: '#9a918d', white: '#ffffff' }
const FONT = `font-family:Georgia,'Times New Roman',serif;`
const SANS = `font-family:Arial,Helvetica,sans-serif;`

const COPY = {
  cart: {
    subject: 'Vaša korpa vas čeka',
    preheader: 'Sačuvali smo proizvode koje ste ostavili u korpi.',
    heading: 'Zaboravili ste nešto?',
    intro: 'proizvodi koje ste dodali u korpu i dalje vas čekaju. Porudžbinu završavate u par koraka, a plaćate tek kada vam kurir donese paket.',
    button: 'Završite porudžbinu',
  },
  browse: {
    subject: 'Još razmišljate o ovome?',
    preheader: 'Proizvodi koje ste nedavno pogledali na Libra Herbal.',
    heading: 'Još razmišljate?',
    intro: 'primetili smo da vas je zanimalo nešto od naših proizvoda. Ako imate pitanje o sastavu ili upotrebi, pišite nam, rado ćemo pomoći.',
    button: 'Pogledajte proizvode',
  },
}

function escape(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function absolute(siteUrl: string, path: string) {
  return /^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`
}

export function reminderEmail(reminder: Reminder, siteUrl: string) {
  const copy = COPY[reminder.kind]
  const greeting = reminder.firstName ? `Zdravo ${reminder.firstName},` : 'Zdravo,'
  const buttonUrl = reminder.kind === 'cart' ? `${siteUrl}/korpa` : `${siteUrl}/proizvodi/${reminder.products[0]!.slug}`

  const productRows = reminder.products.map((product) => {
    const url = `${siteUrl}/proizvodi/${product.slug}`
    const quantity = product.quantity ? `Količina: ${product.quantity}<br>` : ''
    return `
      <tr>
        <td style="padding:12px 0;border-top:1px solid ${COLOR.beige};" width="88" valign="top">
          <a href="${url}"><img src="${escape(absolute(siteUrl, product.image))}" width="72" height="72" alt="${escape(product.name)}" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:8px;background:${COLOR.beige};border:0;"></a>
        </td>
        <td style="padding:12px 0;border-top:1px solid ${COLOR.beige};${SANS}font-size:14px;line-height:20px;color:${COLOR.ink};" valign="top">
          <a href="${url}" style="color:${COLOR.ink};font-weight:bold;text-decoration:none;">${escape(product.name)}</a><br>
          <span style="color:${COLOR.muted};font-size:13px;">${quantity}${product.price},00 RSD</span>
        </td>
      </tr>`
  }).join('')

  const html = `<!doctype html>
<html lang="sr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${copy.subject}</title></head>
<body style="margin:0;padding:0;background:${COLOR.beige};">
  <div style="display:none;max-height:0;overflow:hidden;">${copy.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.beige};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${COLOR.white};border-radius:16px;">
        <tr><td style="padding:32px 32px 0;${FONT}font-size:22px;color:${COLOR.forest};">
          <a href="${siteUrl}" style="color:${COLOR.forest};text-decoration:none;">Libra Herbal</a>
        </td></tr>
        <tr><td style="padding:24px 32px 0;${FONT}font-size:32px;line-height:36px;color:${COLOR.ink};">${copy.heading}</td></tr>
        <tr><td style="padding:16px 32px 8px;${SANS}font-size:15px;line-height:22px;color:${COLOR.ink};">
          ${escape(greeting)} ${copy.intro}
        </td></tr>
        <tr><td style="padding:8px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${productRows}</table>
        </td></tr>
        <tr><td align="center" style="padding:16px 32px 32px;">
          <a href="${buttonUrl}" style="display:inline-block;background:${COLOR.sun};color:${COLOR.ink};${SANS}font-size:15px;font-weight:bold;text-decoration:none;padding:14px 28px;border-radius:999px;">${copy.button}</a>
        </td></tr>
        <tr><td style="padding:16px 32px;background:${COLOR.forest};border-radius:0 0 16px 16px;${SANS}font-size:13px;line-height:20px;color:${COLOR.white};" align="center">
          Plaćanje pouzećem · Dostava za 1–3 radna dana · Besplatna dostava od 4.000,00 RSD
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:16px 32px;${SANS}font-size:12px;line-height:18px;color:${COLOR.muted};" align="center">
          Ovaj podsetnik ste dobili jer imate nalog na <a href="${siteUrl}" style="color:${COLOR.muted};">libraherbal.rs</a>.
          Pitanja? <a href="${siteUrl}/kontakt" style="color:${COLOR.muted};">Kontaktirajte nas</a>.<br>
          <a href="${escape(reminder.unsubscribeUrl)}" style="color:${COLOR.muted};">Odjavite se od podsetnika</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = [
    copy.heading,
    '',
    `${greeting} ${copy.intro}`,
    '',
    ...reminder.products.map(p => `- ${p.name}${p.quantity ? ` × ${p.quantity}` : ''}, ${p.price},00 RSD: ${siteUrl}/proizvodi/${p.slug}`),
    '',
    `${copy.button}: ${buttonUrl}`,
    '',
    'Plaćanje pouzećem · Dostava za 1–3 radna dana · Besplatna dostava od 4.000,00 RSD',
    '',
    `Ovaj podsetnik ste dobili jer imate nalog na libraherbal.rs. Odjava od podsetnika: ${reminder.unsubscribeUrl}`,
  ].join('\n')

  return { subject: copy.subject, html, text }
}
