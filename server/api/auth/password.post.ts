import { changePasswordSchema } from '#shared/schemas/auth'

// POST /api/auth/password — needs the current password; signs out every other device.
// Guessing the current password is limited per IP by RL_AUTH (00.ratelimit.ts).
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { currentPassword, newPassword } = await readValidatedForm(event, changePasswordSchema)
  const db = useDb(event)

  const row = await db.prepare('SELECT password_hash FROM users WHERE id = ?1').bind(user.id).first<{ password_hash: string }>()
  if (!row || !await verifyPassword(currentPassword, row.password_hash)) {
    throw formError(400, { currentPassword: 'Trenutna lozinka nije tačna.' })
  }

  await db.prepare(`UPDATE users SET password_hash = ?2, updated_at = datetime('now') WHERE id = ?1`)
    .bind(user.id, await hashPassword(newPassword)).run()
  await renewUserSessions(event, user.id)
  return sendNoContent(event)
})
