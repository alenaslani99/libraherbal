import { z } from 'zod'

// Auth forms, validated with the same rules in the browser (instant field errors)
// and on the server (readValidatedBody) — the server never trusts what the form already checked.

const email = z.string().trim().toLowerCase()
  .pipe(z.email('Unesite ispravnu email adresu.').max(254, 'Email adresa je predugačka.'))

export const loginSchema = z.object({
  email,
  // no length rules on login: only the stored hash decides
  password: z.string().min(1, 'Unesite lozinku.').max(128, 'Pogrešan email ili lozinka.'),
  remember: z.boolean().default(false),
})

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'Unesite ime.').max(50, 'Ime može imati najviše 50 karaktera.'),
  lastName: z.string().trim().min(1, 'Unesite prezime.').max(50, 'Prezime može imati najviše 50 karaktera.'),
  email,
  phone: z.string().trim().regex(/^[+\d][\d\s/-]{5,24}$/, 'Unesite ispravan broj telefona.'),
  password: z.string()
    .min(8, 'Lozinka mora imati najmanje 8 karaktera.')
    .max(128, 'Lozinka može imati najviše 128 karaktera.'),
  passwordConfirm: z.string(),
  terms: z.literal(true, 'Morate prihvatiti uslove korišćenja.'),
  newsletter: z.boolean().default(false),
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Lozinke se ne poklapaju.',
  path: ['passwordConfirm'],
  // zod 4 skips object refinements while any field has an issue; run it anyway so the
  // mismatch shows together with the other errors
  when: ({ value }) => {
    const v = value as { password?: unknown, passwordConfirm?: unknown }
    return typeof v?.password === 'string' && typeof v?.passwordConfirm === 'string'
  },
})

export type LoginInput = z.input<typeof loginSchema>
export type RegisterInput = z.input<typeof registerSchema>
