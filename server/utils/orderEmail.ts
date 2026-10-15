import type { D1Database } from '@cloudflare/workers-types'
import { type ItemLine, COLOR, divider, emailDocument, escapeHtml, hero, itemRows, SANS, SERIF, textFooter, totalsRows, totalsText, CONTACT_EMAIL } from './emailLayout'

// HTML + plain-text order confirmation, sent right after an order is saved (server/api/orders/index.post.ts),
// to guests too. It isn't marketing, so no unsubscribe link; replies go to the shop's inbox.
// Header, footer, colors and dark mode come from emailLayout.ts.

export interface OrderEmail {
  orderNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
  note: string | null
  items: ItemLine[]
  // RSD
  subtotal: number
  discount: number
  couponCode: string | null
  freeShipping: boolean
}

// a column of the customer block: small caps label and lines; two of them stack on phones
function infoColumn(label: string, lines: string[], width = 268) {
  return `<div style="display:inline-block;width:100%;max-width:${width}px;vertical-align:top;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:0 10px 20px;text-align:left;">
          <div class="c-ink" style="${SANS}font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1px;color:${COLOR.ink};padding-bottom:8px;">${label}</div>
          <div class="c-ink" style="${SANS}font-size:13px;line-height:20px;color:${COLOR.ink};">${lines.map(escapeHtml).join('<br>')}</div>
        </td></tr></table>
      </div>`
}

export function orderEmail(order: OrderEmail, siteUrl: string) {
  const subject = `Potvrda porudžbine #${order.orderNumber}`
  const customer = [`${order.firstName} ${order.lastName}`, order.email, order.phone]
  const address = [order.address, `${order.postalCode} ${order.city}`, 'Srbija']

  const rows = `
        ${hero({
          siteUrl,
          icon: 'box',
          iconSize: 64,
          iconAt: 'afterEyebrow',
          eyebrow: 'PORUDŽBINA JE PRIMLJENA',
          heading: `Hvala Vam,<br><em style="${SERIF}font-style:italic;">${escapeHtml(order.firstName)}</em>`,
          text: `Primili smo Vašu porudžbinu i pripremamo je za slanje.<br>Broj porudžbine: <strong>#${escapeHtml(order.orderNumber)}</strong>`,
        })}
        <tr><td style="padding:12px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
        ${itemRows(order.items, siteUrl)}
        ${totalsRows(order)}
        <tr><td class="c-muted" style="padding:0 32px;${SANS}font-size:12px;line-height:18px;color:${COLOR.muted};">
          Plaćanje pouzećem: iznos plaćate kuriru prilikom preuzimanja paketa.
        </td></tr>
        ${divider('24px 32px 0')}
        <tr><td align="left" style="padding:24px 22px 0;font-size:0;">
          <!--[if mso]><table role="presentation" width="556" cellpadding="0" cellspacing="0"><tr><td width="278" valign="top"><![endif]-->
          ${infoColumn('PODACI KUPCA', customer)}
          <!--[if mso]></td><td width="278" valign="top"><![endif]-->
          ${infoColumn('ADRESA ZA DOSTAVU', address)}
          <!--[if mso]></td></tr></table><![endif]-->
        </td></tr>
        ${order.note ? `<tr><td align="left" style="padding:0 22px;font-size:0;">${infoColumn('NAPOMENA', [order.note], 556)}</td></tr>` : ''}`

  const html = emailDocument({
    siteUrl,
    title: subject,
    preheader: `Primili smo Vašu porudžbinu #${order.orderNumber} i pripremamo je za slanje.`,
    rows,
  })

  const text = [
    `Hvala Vam, ${order.firstName}!`,
    '',
    'Primili smo Vašu porudžbinu i pripremamo je za slanje.',
    `Broj porudžbine: #${order.orderNumber}`,
    '',
    ...order.items.map(i => `- ${i.name} × ${i.quantity}: ${i.price * i.quantity},00 RSD`),
    '',
    ...totalsText(order),
    'Plaćanje pouzećem: iznos plaćate kuriru prilikom preuzimanja paketa.',
    '',
    'PODACI KUPCA',
    ...customer,
    '',
    'ADRESA ZA DOSTAVU',
    ...address,
    ...(order.note ? ['', 'NAPOMENA', order.note] : []),
    '',
    ...textFooter(siteUrl),
  ].join('\n')

  return { subject, html, text }
}

// Reads the saved order (prices as stored at checkout, photos as they are now) and sends the confirmation.
// Without RESEND_API_KEY (local dev) the email is only logged.
export async function sendOrderEmail(db: D1Database, orderNumber: string) {
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')

  const order = await db.prepare(`
    SELECT id, first_name, last_name, email, phone, address, postal_code, city, note, subtotal, discount, coupon_code, shipping_cost
    FROM orders WHERE order_number = ?1
  `).bind(orderNumber).first<{
    id: number, first_name: string, last_name: string, email: string, phone: string, address: string, postal_code: string,
    city: string, note: string | null, subtotal: number, discount: number, coupon_code: string | null, shipping_cost: number
  }>()
  if (!order) throw new Error(`order ${orderNumber} not found`)

  const { results: items } = await db.prepare(`
    SELECT oi.product_name, oi.unit_price, oi.quantity, p.slug, img.src AS image
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    LEFT JOIN images img ON img.product_id = oi.product_id AND img.is_primary = 1
    WHERE oi.order_id = ?1
    ORDER BY oi.id
  `).bind(order.id).all<{ product_name: string, unit_price: number, quantity: number, slug: string | null, image: string | null }>()

  // amounts are in para (1 RSD = 100), the email shows RSD
  const email = orderEmail({
    orderNumber,
    firstName: order.first_name,
    lastName: order.last_name,
    email: order.email,
    phone: order.phone,
    address: order.address,
    postalCode: order.postal_code,
    city: order.city,
    note: order.note,
    items: items.map(i => ({ name: i.product_name, slug: i.slug, image: i.image ?? '', price: i.unit_price / 100, quantity: i.quantity })),
    subtotal: order.subtotal / 100,
    discount: order.discount / 100,
    couponCode: order.coupon_code,
    freeShipping: order.shipping_cost === 0,
  }, siteUrl)

  await sendEmails([{ from: EMAIL_FROM.orders, to: order.email, reply_to: CONTACT_EMAIL, ...email }])
}
