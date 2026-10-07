import { z } from 'zod'

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// Image fields take a URL for now (no upload storage): a site path (/assets/blog/x.jpg) or an https:// link
export const imageUrl = z.string().trim()
  .min(1, 'Unesite adresu slike.')
  .max(500, 'Adresa slike je predugačka.')
  .refine(v => v.startsWith('/') || /^https:\/\/\S+$/.test(v), 'Adresa mora počinjati sa / ili https://')

// /admin blog form, validated in the browser and again by POST/PUT /api/admin/blog
export const blogPostSchema = z.object({
  title: z.string().trim().min(1, 'Unesite naslov.').max(160, 'Naslov može imati najviše 160 karaktera.'),
  slug: z.string().trim()
    .min(1, 'Unesite adresu objave.')
    .max(120, 'Adresa može imati najviše 120 karaktera.')
    .regex(SLUG_PATTERN, 'Samo mala slova bez kvačica, brojevi i crtice (npr. kopriva-u-ishrani).'),
  description: z.string().trim().min(1, 'Unesite kratak opis.').max(300, 'Opis može imati najviše 300 karaktera.'),
  body: z.string().max(100_000, 'Tekst je predugačak.'),
  image: imageUrl,
  imageAlt: z.string().trim().max(200, 'Opis slike može imati najviše 200 karaktera.').default(''),
  tags: z.array(z.string().trim().min(1).max(30, 'Oznaka može imati najviše 30 karaktera.'))
    .max(8, 'Najviše 8 oznaka.')
    .transform(tags => [...new Set(tags)])
    .default([]),
  author: z.string().trim().min(1, 'Unesite autora.').max(80, 'Autor može imati najviše 80 karaktera.').default('Libra Herbal tim'),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published']),
  // 'YYYY-MM-DD'; empty = today when publishing
  publishedAt: z.string().trim().refine(v => !v || DATE_PATTERN.test(v), 'Datum mora biti u obliku GGGG-MM-DD.').default(''),
  productIds: z.array(z.number().int().positive())
    .max(6, 'Najviše 6 preporučenih proizvoda.')
    .transform(ids => [...new Set(ids)])
    .default([]),
})

export type BlogPostInput = z.input<typeof blogPostSchema>
export type BlogPostData = z.output<typeof blogPostSchema>
