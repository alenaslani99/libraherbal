import { z } from 'zod'

// Auth forms, validated with the same rules in the browser (instant field errors)
// and on the server (readValidatedBody) — the server never trusts what the form already checked.

// also used by the contact form (shared/schemas/contact.ts)
export const emailSchema = z.string().trim().toLowerCase()
  .pipe(z.email('Unesite ispravnu email adresu.').max(254, 'Email adresa je predugačka.'))
export const PHONE_PATTERN = /^[+\d][\d\s/-]{5,24}$/

// rules for a password being set (register, change); signing in only checks the stored hash
const newPassword = z.string()
  .min(8, 'Lozinka mora imati najmanje 8 karaktera.')
  .max(128, 'Lozinka može imati najviše 128 karaktera.')

// "Potvrdite lozinku" must repeat `field`. zod 4 skips object refinements while any field
// has an issue; `when` runs it anyway, so the mismatch shows together with the other errors.
function confirms<T extends Record<string, unknown>>(
  field: keyof T & string,
  confirmField: keyof T & string,
): [(data: T) => boolean, { message: string, path: string[], when: (payload: { value: unknown }) => boolean }] {
  return [
    data => data[field] === data[confirmField],
    {
      message: 'Lozinke se ne poklapaju.',
      path: [confirmField],
      when: ({ value }) => {
        const v = value as Record<string, unknown> | undefined
        return typeof v?.[field] === 'string' && typeof v?.[confirmField] === 'string'
      },
    },
  ]
}

export const loginSchema = z.object({
  email: emailSchema,
  // no length rules on login: only the stored hash decides
  password: z.string().min(1, 'Unesite lozinku.').max(128, 'Pogrešan email ili lozinka.'),
  remember: z.boolean().default(false),
})

const registerFields = z.object({
  firstName: z.string().trim().min(1, 'Unesite ime.').max(50, 'Ime može imati najviše 50 karaktera.'),
  lastName: z.string().trim().min(1, 'Unesite prezime.').max(50, 'Prezime može imati najviše 50 karaktera.'),
  email: emailSchema,
  phone: z.string().trim().regex(PHONE_PATTERN, 'Unesite ispravan broj telefona.'),
  password: newPassword,
  passwordConfirm: z.string(),
  terms: z.literal(true, 'Morate prihvatiti uslove korišćenja.'),
  newsletter: z.boolean().default(false),
})
export const registerSchema = registerFields.refine(...confirms<z.output<typeof registerFields>>('password', 'passwordConfirm'))

const changePasswordFields = z.object({
  currentPassword: z.string().min(1, 'Unesite trenutnu lozinku.').max(128, 'Trenutna lozinka nije tačna.'),
  newPassword,
  newPasswordConfirm: z.string(),
})
export const changePasswordSchema = changePasswordFields
  .refine(...confirms<z.output<typeof changePasswordFields>>('newPassword', 'newPasswordConfirm'))

export type LoginInput = z.input<typeof loginSchema>
export type RegisterInput = z.input<typeof registerSchema>
export type ChangePasswordInput = z.input<typeof changePasswordSchema>
