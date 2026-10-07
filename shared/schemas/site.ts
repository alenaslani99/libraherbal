import { z } from 'zod'
import { imageUrl } from './blog'

// Home page hero, edited in /admin/pocetna. Validated in the browser and again by PUT /api/admin/hero.

const text = (min: number, max: number, label: string) => z.string().trim()
  .min(min, `Unesite ${label.toLowerCase()}.`)
  .max(max, `${label} može imati najviše ${max} karaktera.`)

// a page on this site (/proizvodi) or an https:// link; '' allowed (optional button)
const link = z.string().trim()
  .max(300, 'Link je predugačak.')
  .refine(v => !v || v.startsWith('/') || /^https:\/\/\S+$/.test(v), 'Link mora počinjati sa / ili https://')

// <input type="number"> gives '' when empty
const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v)

export const heroSchema = z.object({
  titleLine1: text(1, 40, 'Prvi red naslova'),
  titleLine2: text(0, 40, 'Drugi red naslova').default(''),
  subtitle: text(0, 200, 'Podnaslov').default(''),
  image: imageUrl,
  imageAlt: text(0, 150, 'Opis slike').default(''),

  primaryLabel: text(1, 30, 'Tekst prvog dugmeta'),
  primaryLink: link.min(1, 'Unesite link.'),
  // the second button shows only when both are filled in
  secondaryLabel: text(0, 30, 'Tekst drugog dugmeta').default(''),
  secondaryLink: link.default(''),

  showRating: z.boolean().default(true),
  // null = average of the approved reviews
  ratingOverride: z.preprocess(emptyToNull, z.number('Unesite broj.').min(1, 'Ocena mora biti između 1 i 5.').max(5, 'Ocena mora biti između 1 i 5.').multipleOf(0.1, 'Najviše jedna decimala.').nullable()).default(null),
  ratingLabel: text(0, 40, 'Tekst ispod ocene').default(''),
  badgeTitle: text(0, 40, 'Naslov oznake').default(''),
  badgeText: text(0, 40, 'Tekst oznake').default(''),
})
export type HeroInput = z.input<typeof heroSchema>
export type HeroSettings = z.output<typeof heroSchema>
