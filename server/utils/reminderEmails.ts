import { type FeaturedProduct, absolute, button, COLOR, divider, emailDocument, escapeHtml, hero, productFeature, SANS, SERIF, textFooter } from './emailLayout'

// HTML + plain-text reminder emails (abandoned cart, viewed products), sent by server/tasks/emails/reminders.ts.
// Header, footer, colors and dark mode come from emailLayout.ts.

export interface ReminderProduct extends FeaturedProduct {
  // cart only
  quantity?: number
}

export interface Reminder {
  kind: 'cart' | 'browse'
  products: ReminderProduct[]
  unsubscribeUrl: string
}

const COPY = {
  cart: {
    subject: 'Vaša korpa vas čeka',
    preheader: 'Sačuvali smo proizvode koje ste ostavili u korpi.',
    icon: 'cursor',
    eyebrow: 'JOŠ SAMO PAR KLIKOVA',
    heading: 'Zaboravili ste na proizvode u korpi',
    text: (count: number) => count === 1
      ? 'Ostavili ste odabrani proizvod u korpi. Sačuvali smo ga da biste mogli lako da nastavite tamo gde ste stali.'
      : 'Ostavili ste nekoliko odabranih stvari u korpi. Sačuvali smo ih da biste mogli lako da nastavite tamo gde ste stali.',
  },
  browse: {
    subject: 'Još razmišljate o ovome?',
    preheader: 'Proizvodi koje ste nedavno pogledali na Libra Herbal.',
    icon: 'eye',
    eyebrow: 'POGLEDAJTE PONOVO',
    heading: 'Nešto Vam je privuklo pažnju?',
    text: (count: number) => count === 1
      ? 'Ako još uvek razmišljate o kupovini, evo brzog podsetnika na proizvod koji ste nedavno gledali.'
      : 'Ako još uvek razmišljate o kupovini, evo brzog podsetnika na proizvode koje ste nedavno gledali.',
  },
}

function rsd(amount: number, size: number) {
  return `${amount},00 <span style="font-size:${Math.round(size * 0.6)}px;">RSD</span>`
}

// Rows: one line per cart item (photo, name + quantity, price), then subtotal, shipping and total
function cartRows(products: ReminderProduct[], siteUrl: string) {
  const items = products.map((product, i) => {
    const url = `${siteUrl}/proizvodi/${product.slug}`
    const quantity = product.quantity ?? 1
    return `${i ? divider('0 32px') : ''}
    <tr><td style="padding:20px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="80" valign="middle" style="padding-right:16px;">
          <a href="${url}"><img src="${escapeHtml(absolute(siteUrl, product.image))}" width="80" height="80" alt="${escapeHtml(product.name)}" style="display:block;width:80px;height:80px;object-fit:cover;border-radius:10px;background:${COLOR.beige};border:0;"></a>
        </td>
        <td valign="middle">
          <a href="${url}" class="c-forest" style="${SERIF}font-size:22px;line-height:28px;font-weight:600;color:${COLOR.forest};text-decoration:none;">${escapeHtml(product.name)}</a>
          <div class="c-ink" style="${SANS}font-size:12px;line-height:18px;color:${COLOR.ink};padding-top:2px;">Količina: ${quantity}</div>
        </td>
        <td valign="middle" align="right" style="white-space:nowrap;padding-left:8px;">
          <div class="c-muted" style="${SANS}font-size:12px;line-height:18px;color:${COLOR.muted};">${product.price},00 RSD&nbsp;×${quantity}</div>
          <div class="c-ink" style="${SANS}font-size:18px;line-height:24px;font-weight:bold;color:${COLOR.ink};">${rsd(product.price * quantity, 18)}</div>
        </td>
      </tr></table>
    </td></tr>`
  }).join('')

  const { subtotal, shipping } = cartTotals(products)
  const line = (label: string, value: string, strong = false) => `<tr>
        <td class="c-ink" style="${SANS}font-size:${strong ? 15 : 13}px;line-height:22px;${strong ? 'font-weight:bold;' : ''}color:${COLOR.ink};padding:6px 0;">${label}</td>
        <td class="c-ink" align="right" style="${SANS}font-size:${strong ? 20 : 15}px;line-height:22px;font-weight:bold;color:${COLOR.ink};padding:6px 0;white-space:nowrap;">${value}</td>
      </tr>`

  return `${divider('0 32px')}
    ${items}
    ${divider('0 32px')}
    <tr><td style="padding:12px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${line('Međuzbir', rsd(subtotal, 15))}
        ${line('Dostava', shipping ? rsd(shipping, 15) : 'Besplatna')}
      </table>
    </td></tr>
    ${divider('0 32px')}
    <tr><td style="padding:12px 32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${line('UKUPNO', rsd(subtotal + shipping, 20), true)}</table>
    </td></tr>
    <tr><td style="padding:8px 32px 0;">${button(`${siteUrl}/korpa`, 'PORUČITE ODMAH&nbsp;&nbsp;→', true)}</td></tr>`
}

// RSD; shipping by the same rule as checkout (free from 4.000 RSD), before any discount code
function cartTotals(products: ReminderProduct[]) {
  const subtotal = products.reduce((sum, p) => sum + p.price * (p.quantity ?? 1), 0)
  return { subtotal, shipping: shippingFor(subtotal * 100) / 100 }
}

export function reminderEmail(reminder: Reminder, siteUrl: string) {
  const copy = COPY[reminder.kind]
  const { products } = reminder

  const rows = `
        ${hero({ siteUrl, icon: copy.icon, iconSize: 56, eyebrow: copy.eyebrow, heading: copy.heading, text: copy.text(products.length) })}
        ${reminder.kind === 'cart'
          ? cartRows(products, siteUrl)
          : products.map((product, i) => (i ? divider() : '') + productFeature(product, siteUrl, true)).join('')}`

  const html = emailDocument({ siteUrl, title: copy.subject, preheader: copy.preheader, rows, unsubscribeUrl: reminder.unsubscribeUrl })

  const totals = cartTotals(products)
  const text = [
    copy.heading,
    '',
    copy.text(products.length),
    '',
    ...products.map(p => reminder.kind === 'cart'
      ? `- ${p.name} × ${p.quantity ?? 1}: ${p.price * (p.quantity ?? 1)},00 RSD`
      : `- ${p.name}, ${p.price},00 RSD: ${siteUrl}/proizvodi/${p.slug}`),
    ...(reminder.kind === 'cart'
      ? ['', `Međuzbir: ${totals.subtotal},00 RSD`, `Dostava: ${totals.shipping ? `${totals.shipping},00 RSD` : 'Besplatna'}`, `UKUPNO: ${totals.subtotal + totals.shipping},00 RSD`, '', `Poručite odmah: ${siteUrl}/korpa`]
      : []),
    '',
    ...textFooter(siteUrl, reminder.unsubscribeUrl),
  ].join('\n')

  return { subject: copy.subject, html, text }
}
