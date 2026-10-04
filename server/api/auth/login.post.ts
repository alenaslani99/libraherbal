import { loginSchema } from '#shared/schemas/auth'
import type { AuthUser } from '#shared/types/auth'

// POST /api/auth/login
// One message for a wrong email and a wrong password, and the same hashing work for both,
// so the endpoint doesn't reveal which emails have an account.
// TODO: rate-limit attempts per IP/email (Cloudflare rate limiting binding)
export default defineEventHandler(async (event): Promise<AuthUser> => {
  const { email, password, remember } = await readValidatedForm(event, loginSchema)

  const row = await useDb(event).prepare(`SELECT ${USER_COLUMNS}, u.password_hash FROM users u WHERE u.email = ?1`)
    .bind(email).first<UserRow & { password_hash: string }>()

  const valid = await verifyPassword(password, row?.password_hash ?? DUMMY_PASSWORD_HASH)
  if (!row || !valid) throw createError({ statusCode: 401, message: 'Pogrešan email ili lozinka.' })

  await createSession(event, row.id, remember)
  return toAuthUser(row)
})
