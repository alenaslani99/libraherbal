import { z } from 'zod'

const bodySchema = z.object({ enabled: z.boolean() })

// PUT /api/account/reminders — the switch on /nalog: reminder emails (abandoned cart, viewed products) on or off.
// Turning them off is the same as the "odjavite se" link in such an email.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { enabled } = await readValidatedBody(event, bodySchema.parse)

  await useDb(event).prepare(`
    UPDATE users SET reminder_emails = ?2, updated_at = datetime('now')
    WHERE id = ?1 AND reminder_emails <> ?2
  `).bind(user.id, enabled ? 1 : 0).run()

  setResponseStatus(event, 204)
})
