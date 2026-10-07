import { z } from 'zod'
import { SLUG_PATTERN } from './blog'

// /admin/kategorije forms, validated in the browser and again by the /api/admin catalog routes

// PUT /api/admin/catalog/categories/:id — only the name: slugs are tied to the /med, /cajevi, /melemi pages
export const categoryNameSchema = z.object({
  name: z.string().trim().min(1, 'Unesite naziv.').max(40, 'Naziv može imati najviše 40 karaktera.'),
})

// POST/PUT /api/admin/catalog/purposes — slug is the filter value (?kategorija=imunitet)
export const purposeSchema = z.object({
  name: z.string().trim().min(1, 'Unesite naziv.').max(40, 'Naziv može imati najviše 40 karaktera.'),
  slug: z.string().trim()
    .min(1, 'Unesite adresu.')
    .max(60, 'Adresa može imati najviše 60 karaktera.')
    .regex(SLUG_PATTERN, 'Samo mala slova bez kvačica, brojevi i crtice (npr. krvna-slika).'),
})

// PUT /api/admin/catalog/purposes/order — every purpose id, in the new order
export const purposeOrderSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(100),
})

// POST/PUT /api/admin/ingredients — the product form sends only a name
export const ingredientSchema = z.object({
  name: z.string().trim().min(1, 'Unesite naziv sastojka.').max(80, 'Naziv može imati najviše 80 karaktera.'),
  description: z.string().trim().max(300, 'Opis može imati najviše 300 karaktera.').default(''),
})
