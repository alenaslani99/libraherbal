import { newsletterSchema } from '#shared/schemas/engagement'

// POST /api/newsletter — { email, source }. Always the same answer, whether the address was new,
// already on the list or a bot (honeypot), so the form can't be used to check who is subscribed.
// Rate limited in the strict tier (00.ratelimit.ts).
// TODO: welcome email + unsubscribe link via Resend (see PLAN.md, TODO)
export default defineEventHandler(async (event) => {
  const { email, source, website } = await readValidatedForm(event, newsletterSchema)
  if (website) return sendNoContent(event)

  const user = await getSessionUser(event)
  await subscribe(event, email, source, user?.email === email ? user.id : null)
  return sendNoContent(event)
})
