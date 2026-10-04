import type { H3Event } from 'h3'
import { loginSchema } from '#shared/schemas/auth'
import type { AuthUser } from '#shared/types/auth'

// 10 wrong passwords within 15 minutes lock the email until that window ends
const MAX_FAILURES = 10
const WINDOW = '-15 minutes'
const LOCKED = 'Previše neuspešnih pokušaja prijave. Pokušajte ponovo za 15 minuta.'

// POST /api/auth/login
// One message for a wrong email and a wrong password, and the same hashing work for both,
// so the endpoint doesn't reveal which emails have an account. Same for the lockout: it applies to any email.
// Limits: per IP (00.ratelimit.ts), per email per minute (RL_LOGIN_EMAIL), and the lockout above.
export default defineEventHandler(async (event): Promise<AuthUser> => {
  const { email, password, remember } = await readValidatedForm(event, loginSchema)
  await rateLimit(event, 'RL_LOGIN_EMAIL', email)

  const db = useDb(event)
  const locked = await db.prepare(`
    SELECT 1 FROM login_failures
    WHERE email = ?1 AND failures >= ?2 AND window_started_at > datetime('now', ?3)
  `).bind(email, MAX_FAILURES, WINDOW).first()
  if (locked) throw createError({ statusCode: 429, message: LOCKED })

  const row = await db.prepare(`SELECT ${USER_COLUMNS}, u.password_hash FROM users u WHERE u.email = ?1`)
    .bind(email).first<UserRow & { password_hash: string }>()

  const valid = await verifyPassword(password, row?.password_hash ?? DUMMY_PASSWORD_HASH)
  if (!row || !valid) {
    await recordFailure(event, email)
    throw createError({ statusCode: 401, message: 'Pogrešan email ili lozinka.' })
  }

  await db.prepare('DELETE FROM login_failures WHERE email = ?1').bind(email).run()
  await createSession(event, row.id, remember)
  return toAuthUser(row)
})

// Counts the miss in the current 15-minute window (an expired window starts over at 1)
async function recordFailure(event: H3Event, email: string) {
  const db = useDb(event)
  await db.batch([
    db.prepare(`
      INSERT INTO login_failures (email) VALUES (?1)
      ON CONFLICT (email) DO UPDATE SET
        failures = CASE WHEN window_started_at <= datetime('now', ?2) THEN 1 ELSE failures + 1 END,
        window_started_at = CASE WHEN window_started_at <= datetime('now', ?2) THEN datetime('now') ELSE window_started_at END
    `).bind(email, WINDOW),
    // housekeeping: windows that ended long ago
    db.prepare(`DELETE FROM login_failures WHERE window_started_at < datetime('now', '-1 day')`),
  ])
}
