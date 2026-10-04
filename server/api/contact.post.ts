import { contactSchema } from '#shared/schemas/contact'

// POST /api/contact — stores a /kontakt message for the admin.
// Rate limited in the strict tier (00.ratelimit.ts) against spam.
// TODO: email notification to the shop via Resend
export default defineEventHandler(async (event) => {
  const { name, email, phone, message, website } = await readValidatedForm(event, contactSchema)

  // honeypot filled = a bot: answer like a success so it has nothing to learn from
  if (website) return sendNoContent(event)

  const user = await getSessionUser(event)
  await useDb(event).prepare(`
    INSERT INTO contact_messages (user_id, name, email, phone, message)
    VALUES (?1, ?2, ?3, ?4, ?5)
  `).bind(user?.id ?? null, name, email, phone || null, message).run()

  return sendNoContent(event)
})
