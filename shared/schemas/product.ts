import { z } from 'zod'
import { imageUrl, SLUG_PATTERN } from './blog'

// /admin product form, validated in the browser and again by POST/PUT /api/admin/products.
// Prices are whole RSD here (the DB stores para); sale dates are ISO UTC strings, '' = none.

const text = (max: number, label: string) => z.string().trim().max(max, `${label} može imati najviše ${max} karaktera.`).default('')
const ids = (max: number, message: string) => z.array(z.number().int().positive()).max(max, message).transform(list => [...new Set(list)]).default([])
const isoDate = z.string().trim().refine(v => !v || !Number.isNaN(Date.parse(v)), 'Neispravan datum.').default('')

// <input type="number"> gives '' when empty
const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v)

export const adminProductSchema = z.object({
  name: z.string().trim().min(1, 'Unesite naziv.').max(120, 'Naziv može imati najviše 120 karaktera.'),
  slug: z.string().trim()
    .min(1, 'Unesite adresu proizvoda.')
    .max(120, 'Adresa može imati najviše 120 karaktera.')
    .regex(SLUG_PATTERN, 'Samo mala slova bez kvačica, brojevi i crtice (npr. imuno-med).'),
  categoryId: z.number('Izaberite kategoriju.').int().positive('Izaberite kategoriju.'),
  weightLabel: text(30, 'Pakovanje'),
  isActive: z.boolean().default(true),
  popular: z.boolean().default(false),

  description: text(4000, 'Opis'),
  usageInstructions: text(2000, 'Način upotrebe'),
  nutritionInfo: text(2000, 'Nutritivna vrednost'),

  price: z.preprocess(emptyToNull, z.number('Unesite cenu.').int('Cena mora biti ceo broj.').min(1, 'Cena mora biti veća od 0.').max(1_000_000, 'Cena je prevelika.')),
  salePrice: z.preprocess(emptyToNull, z.number().int('Akcijska cena mora biti ceo broj.').min(1, 'Akcijska cena mora biti veća od 0.').nullable()).default(null),
  saleStartsAt: isoDate,
  saleEndsAt: isoDate,

  stock: z.preprocess(emptyToNull, z.number('Unesite zalihe.').int('Zalihe moraju biti ceo broj.').min(0, 'Zalihe ne mogu biti negativne.').max(100_000, 'Zalihe su prevelike.')),

  // the first image is the main one (cards, Google)
  images: z.array(z.object({
    src: imageUrl,
    alt: z.string().trim().max(200, 'Opis slike može imati najviše 200 karaktera.').default(''),
  })).max(10, 'Najviše 10 slika.').default([]),

  purposeIds: ids(10, 'Najviše 10 svrha.'),
  // in display order (01, 02, 03 on the product page)
  ingredientIds: ids(30, 'Najviše 30 sastojaka.'),
  recommendedIds: ids(4, 'Najviše 4 preporučena proizvoda.'),
}).superRefine((data, ctx) => {
  if (data.salePrice !== null && data.salePrice >= data.price) {
    ctx.addIssue({ code: 'custom', path: ['salePrice'], message: 'Akcijska cena mora biti niža od redovne.' })
  }
  if (data.salePrice === null && (data.saleStartsAt || data.saleEndsAt)) {
    ctx.addIssue({ code: 'custom', path: ['salePrice'], message: 'Unesite akcijsku cenu ili obrišite datume akcije.' })
  }
  if (data.saleStartsAt && data.saleEndsAt && Date.parse(data.saleEndsAt) <= Date.parse(data.saleStartsAt)) {
    ctx.addIssue({ code: 'custom', path: ['saleEndsAt'], message: 'Kraj akcije mora biti posle početka.' })
  }
})

export type AdminProductInput = z.input<typeof adminProductSchema>
export type AdminProductData = z.output<typeof adminProductSchema>

// PATCH /api/admin/products/:id — quick show/hide from the list
export const adminProductActiveSchema = z.object({ isActive: z.boolean() })
