import { z } from 'zod'
import { emailSchema } from './auth'

// Newsletter sign-up, product reviews and the home page testimonials ("Uspešne priče").
// Validated in the browser and again on the server.

// POST /api/newsletter — `source` says which form; `website` is a honeypot (bots fill it, people never see it)
export const newsletterSchema = z.object({
  email: emailSchema,
  source: z.enum(['footer', 'section']),
  website: z.string().max(200).default(''),
})
export type NewsletterInput = z.input<typeof newsletterSchema>

// POST /api/products/:slug/reviews — signed-in customers only, one review per product
export const reviewSchema = z.object({
  rating: z.number('Izaberite ocenu.').int().min(1, 'Izaberite ocenu.').max(5, 'Izaberite ocenu.'),
  comment: z.string().trim().max(1000, 'Komentar može imati najviše 1000 karaktera.').default(''),
})
export type ReviewInput = z.input<typeof reviewSchema>

// PATCH /api/admin/reviews/:id — show it on the site or take it back down
export const reviewApprovalSchema = z.object({ approved: z.boolean() })

// POST/PUT /api/admin/testimonials
export const testimonialSchema = z.object({
  author: z.string().trim().min(1, 'Unesite ime.').max(60, 'Ime može imati najviše 60 karaktera.'),
  text: z.string().trim().min(10, 'Utisak mora imati najmanje 10 karaktera.').max(400, 'Utisak može imati najviše 400 karaktera.'),
  rating: z.number().int().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
})
export type TestimonialInput = z.input<typeof testimonialSchema>

// PUT /api/admin/testimonials/order — every testimonial id, in the new order
export const testimonialOrderSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
})
