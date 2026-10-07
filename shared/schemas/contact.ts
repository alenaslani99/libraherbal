import { z } from 'zod'
import { emailSchema, PHONE_PATTERN } from './auth'

// /kontakt form, validated in the browser and again by POST /api/contact
export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Unesite ime i prezime.').max(100, 'Ime može imati najviše 100 karaktera.'),
  email: emailSchema,
  // optional: empty is fine, anything else must look like a phone number
  phone: z.string().trim().refine(v => !v || PHONE_PATTERN.test(v), 'Unesite ispravan broj telefona.').default(''),
  message: z.string().trim()
    .min(10, 'Poruka mora imati najmanje 10 karaktera.')
    .max(1000, 'Poruka može imati najviše 1000 karaktera.'),
  // honeypot: hidden from people, bots fill it in — the server then quietly drops the message
  website: z.string().max(200).default(''),
})

export type ContactInput = z.input<typeof contactSchema>

// Body of PATCH /api/admin/messages/:id
export const contactMessageUpdateSchema = z.object({
  status: z.enum(['new', 'read', 'answered'], 'Nepoznat status poruke.'),
})
