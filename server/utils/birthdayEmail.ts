import { type FeaturedProduct, couponRows, divider, emailDocument, escapeHtml, hero, productFeature, SERIF, textFooter } from './emailLayout'

// HTML + plain-text birthday email with a 10% code (BTHD…), sent by server/tasks/emails/birthdays.ts.
// The same layout as the welcome email, with a cake; header, footer and dark mode from emailLayout.ts.

export interface Birthday {
  firstName: string
  code: string
  percent: number
  // already formatted, e.g. "14.11.2026."
  validUntil: string
  // null = the featured product isn't available, the block is left out
  product: FeaturedProduct | null
  unsubscribeUrl: string
}

const INTRO = 'Želimo Vam mnogo zdravlja, radosti i lepih trenutaka u godini koja je pred Vama. Da proslava bude još lepša, spremili smo Vam mali rođendanski poklon.'

export function birthdayEmail(birthday: Birthday, siteUrl: string) {
  const { product } = birthday
  const name = birthday.firstName.trim()
  const subject = name ? `Srećan rođendan, ${name}! Poklon od ${birthday.percent}% za Vas` : `Srećan rođendan! Poklon od ${birthday.percent}% za Vas`

  const rows = `
        ${hero({
          siteUrl,
          icon: 'cake',
          iconSize: 96,
          iconAt: 'afterHeading',
          eyebrow: 'VAŠ DAN',
          heading: name ? `Srećan rođendan,<br><em style="${SERIF}font-style:italic;">${escapeHtml(name)}</em>` : 'Srećan rođendan!',
          text: INTRO,
        })}
        ${couponRows({
          siteUrl,
          heading: `${birthday.percent}% popusta za Vaš rođendan`,
          text: `Unesite kod prilikom plaćanja i ostvarite ${birthday.percent}% popusta`,
          code: birthday.code,
          validUntil: birthday.validUntil,
        })}
        ${product ? divider() + productFeature(product, siteUrl) : ''}`

  const html = emailDocument({
    siteUrl,
    title: subject,
    preheader: `Za Vaš rođendan: kod za ${birthday.percent}% popusta na sledeću porudžbinu.`,
    rows,
    unsubscribeUrl: birthday.unsubscribeUrl,
  })

  const text = [
    name ? `Srećan rođendan, ${name}!` : 'Srećan rođendan!',
    '',
    INTRO,
    '',
    `${birthday.percent}% popusta za Vaš rođendan. Unesite kod prilikom plaćanja:`,
    '',
    birthday.code,
    '',
    `Kod važi do ${birthday.validUntil} i može se iskoristiti jednom.`,
    `Pogledajte prodavnicu: ${siteUrl}/proizvodi`,
    ...(product ? ['', `${product.name}, ${product.price},00 RSD`, product.description, `Poručite odmah: ${siteUrl}/proizvodi/${product.slug}`] : []),
    '',
    ...textFooter(siteUrl, birthday.unsubscribeUrl),
  ].join('\n')

  return { subject, html, text }
}
