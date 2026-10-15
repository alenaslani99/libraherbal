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

  // for the unsubscribe link in the welcome email (and later reminders)
  const unsubscribeToken = toHex(crypto.getRandomValues(new Uint8Array(32)))

  let row
  try {
    row = await db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, newsletter, terms_accepted_at, unsubscribe_token, birth_date)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'), ?7, ?8)
      RETURNING id, email, first_name, last_name, phone, role, reminder_emails
    `).bind(
      input.email,
      await hashPassword(input.password),
      input.firstName,
      input.lastName,
      input.phone,
      input.newsletter ? 1 : 0,
      unsubscribeToken,
      // already checked by the schema; set only here, there is no way to change it later
      birthDateToIso(input.birthDate),
    ).first<Omit<UserRow, 'subscribed'>>()
  }
  catch (error) {
    if (String(error).includes('UNIQUE')) throw formError(409, EMAIL_TAKEN)
    throw error
  }
  if (!row) throw createError({ statusCode: 500, message: 'Registracija nije uspela.' })

  // "Želim da primam novosti" → the same list as the newsletter forms
  if (input.newsletter) await subscribe(event, row.email, 'register', row.id)
  // the address may already be on the list from a footer sign-up before registering
  const subscribed = input.newsletter || !!(await db.prepare(`SELECT 1 FROM newsletter_subscribers WHERE email = ?1 AND status = 'subscribed'`)
    .bind(row.email).first())

  // after the response, so Resend doesn't slow down registration; a failed email doesn't fail the account
  const user = { id: row.id, email: row.email, unsubscribeToken }
  event.waitUntil(sendWelcomeEmail(db, user).catch(error => console.error('[email] welcome failed', user.id, error)))

  await createSession(event, row.id, false)
  return toAuthUser({ ...row, subscribed: subscribed ? 1 : 0 })
})
