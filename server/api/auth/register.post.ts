import { registerSchema } from '#shared/schemas/auth'
import type { AuthUser } from '#shared/types/auth'

const EMAIL_TAKEN = { email: 'Nalog sa ovom email adresom već postoji.' }

// POST /api/auth/register — creates the account and signs it in ("Zapamti me" off).
export default defineEventHandler(async (event): Promise<AuthUser> => {
  const input = await readValidatedForm(event, registerSchema)
  const db = useDb(event)

  // checked before hashing, so a taken email answers fast; the UNIQUE constraint still guards the race
  if (await db.prepare('SELECT 1 FROM users WHERE email = ?1').bind(input.email).first()) {
    throw formError(409, EMAIL_TAKEN)
  }

  let row
  try {
    row = await db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, newsletter, terms_accepted_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))
      RETURNING id, email, first_name, last_name, phone, role
    `).bind(
      input.email,
      await hashPassword(input.password),
      input.firstName,
      input.lastName,
      input.phone,
      input.newsletter ? 1 : 0,
    ).first<UserRow>()
  }
  catch (error) {
    if (String(error).includes('UNIQUE')) throw formError(409, EMAIL_TAKEN)
    throw error
  }
  if (!row) throw createError({ statusCode: 500, message: 'Registracija nije uspela.' })

  await createSession(event, row.id, false)
  return toAuthUser(row)
})
