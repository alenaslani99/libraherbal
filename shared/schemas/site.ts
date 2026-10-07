import { z } from 'zod'
import { imageUrl } from './blog'

// Home page hero, edited in /admin/pocetna: a background plus a list of elements the admin
// adds, orders and removes. Validated in the browser and again by PUT /api/admin/hero.

const text = (min: number, max: number, label: string) => z.string().trim()
  .min(min, `Unesite ${label.toLowerCase()}.`)
  .max(max, `${label} može imati najviše ${max} karaktera.`)

// a page on this site (/proizvodi) or an https:// link
const link = z.string().trim()
  .min(1, 'Unesite link.')
  .max(300, 'Link je predugačak.')
  .refine(v => v.startsWith('/') || /^https:\/\/\S+$/.test(v), 'Link mora počinjati sa / ili https://')

// <input type="number"> gives '' when empty
const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v)

// made in the browser, only used as the list key while editing
const elementId = z.string().min(1).max(40)

export const HERO_ELEMENT_TYPES = ['eyebrow', 'heading', 'text', 'buttons', 'rating', 'badge', 'checklist', 'countdown', 'product'] as const
export type HeroElementType = typeof HERO_ELEMENT_TYPES[number]
export const HERO_MAX_ELEMENTS = 8

export const heroElementSchema = z.discriminatedUnion('type', [
  // small text above the headline ("NOVO", "AKCIJA -20%")
  z.object({ id: elementId, type: z.literal('eyebrow'), text: text(1, 40, 'Natpis') }),
  // the h1; each line white or sun-yellow italic
  z.object({
    id: elementId,
    type: z.literal('heading'),
    lines: z.array(z.object({ text: text(1, 40, 'Red naslova'), accent: z.boolean().default(false) }))
      .min(1, 'Dodajte bar jedan red.').max(3, 'Najviše 3 reda.'),
  }),
  z.object({ id: elementId, type: z.literal('text'), text: text(1, 300, 'Tekst') }),
  z.object({
    id: elementId,
    type: z.literal('buttons'),
    buttons: z.array(z.object({
      label: text(1, 30, 'Tekst dugmeta'),
      link,
      style: z.enum(['solid', 'outline']).default('solid'),
    })).min(1, 'Dodajte bar jedno dugme.').max(3, 'Najviše 3 dugmeta.'),
  }),
  // stars: the approved reviews' average, unless the admin types a number
  z.object({
    id: elementId,
    type: z.literal('rating'),
    label: text(0, 40, 'Tekst ispod ocene').default(''),
    override: z.preprocess(emptyToNull, z.number('Unesite broj.').min(1, 'Ocena mora biti između 1 i 5.').max(5, 'Ocena mora biti između 1 i 5.').multipleOf(0.1, 'Najviše jedna decimala.').nullable()).default(null),
  }),
  z.object({ id: elementId, type: z.literal('badge'), title: text(1, 40, 'Naslov oznake'), text: text(0, 40, 'Tekst oznake').default('') }),
  z.object({
    id: elementId,
    type: z.literal('checklist'),
    items: z.array(text(1, 60, 'Stavka')).min(1, 'Dodajte bar jednu stavku.').max(5, 'Najviše 5 stavki.'),
  }),
  // hidden once the date has passed; endsAt is ISO (UTC)
  z.object({
    id: elementId,
    type: z.literal('countdown'),
    label: text(0, 40, 'Tekst iznad odbrojavanja').default(''),
    endsAt: z.string().trim().min(1, 'Izaberite datum i vreme.').refine(v => !Number.isNaN(Date.parse(v)), 'Neispravan datum.'),
  }),
  // an active product's card: image, name, current price; hidden if the product is turned off
  z.object({
    id: elementId,
    type: z.literal('product'),
    label: text(0, 30, 'Natpis iznad proizvoda').default(''),
    productId: z.number('Izaberite proizvod.').int().positive('Izaberite proizvod.'),
  }),
])
export type HeroElement = z.output<typeof heroElementSchema>
export type HeroElementInput = z.input<typeof heroElementSchema>

export const heroSchema = z.object({
  image: imageUrl,
  imageAlt: text(0, 150, 'Opis slike').default(''),
  // how dark the photo gets behind the text
  overlay: z.enum(['light', 'medium', 'dark']).default('medium'),
  align: z.enum(['left', 'center']).default('left'),
  height: z.enum(['tall', 'medium']).default('tall'),
  elements: z.array(heroElementSchema)
    .min(1, 'Dodajte bar jedan element.')
    .max(HERO_MAX_ELEMENTS, `Najviše ${HERO_MAX_ELEMENTS} elemenata.`)
    .refine(list => list.filter(e => e.type === 'heading').length <= 1, 'Hero može imati samo jedan naslov.'),
})
export type HeroInput = z.input<typeof heroSchema>
export type HeroSettings = z.output<typeof heroSchema>
