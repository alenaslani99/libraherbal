import { z } from 'zod'
import { emailSchema, PHONE_PATTERN } from './auth'

// Body of POST /api/orders — same rules as the /placanje form (validate() there).
// Only product ids and quantities come from the browser: the server prices everything from D1.
const required = (message: string, max = 100) => z.string().trim().min(1, message).max(max, `Najviše ${max} karaktera.`)

export const orderSchema = z.object({
  shipping: z.object({
    firstName: required('Unesite ime.'),
    lastName: required('Unesite prezime.'),
    email: emailSchema,
    phone: z.string().trim().regex(PHONE_PATTERN, 'Unesite ispravan broj telefona.'),
    city: required('Unesite grad.'),
    address: required('Unesite adresu za dostavu.', 200),
    postalCode: z.string().trim().regex(/^\d{5}$/, 'Poštanski broj ima 5 cifara.'),
    note: z.string().trim().max(500, 'Napomena može imati najviše 500 karaktera.').default(''),
  }),
  paymentMethod: z.literal('pouzece'),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
  })).min(1, 'Korpa je prazna.').max(100),
})
