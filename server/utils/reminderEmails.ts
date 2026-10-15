import { type FeaturedProduct, button, divider, emailDocument, hero, itemRows, productFeature, textFooter, totalsRows, totalsText } from './emailLayout'

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

// RSD; free shipping by the same rule as checkout (from 4.000 RSD), before any discount code
function cartTotals(products: ReminderProduct[]) {
  const subtotal = products.reduce((sum, p) => sum + p.price * (p.quantity ?? 1), 0)
  return { subtotal, freeShipping: shippingFor(subtotal * 100) === 0 }
}

// Rows: the cart items, totals and the order button
function cartRows(products: ReminderProduct[], siteUrl: string) {
  const items = products.map(p => ({ name: p.name, slug: p.slug, image: p.image, price: p.price, quantity: p.quantity ?? 1 }))
  return `${divider('0 32px')}
    ${itemRows(items, siteUrl)}
    ${totalsRows(cartTotals(products))}
    <tr><td style="padding:8px 32px 0;">${button(`${siteUrl}/korpa`, 'PORUČITE ODMAH&nbsp;&nbsp;→', true)}</td></tr>`
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
      ? ['', ...totalsText(totals), '', `Poručite odmah: ${siteUrl}/korpa`]
      : []),
    '',
    ...textFooter(siteUrl, reminder.unsubscribeUrl),
  ].join('\n')

  return { subject: copy.subject, html, text }
}
