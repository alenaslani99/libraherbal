import { newsletterSchema } from '#shared/schemas/engagement'
import type { NewsletterResult } from '#shared/types/engagement'

// POST /api/newsletter — { email, source }. Says whether the address was already on the list,
// so the form can show "already subscribed"; a bot (honeypot) gets the plain success answer.
// Rate limited in the strict tier (00.ratelimit.ts), which also limits checking who is subscribed.
// TODO: welcome email + unsubscribe link via Resend (see PLAN.md, TODO)
export default defineEventHandler(async (event): Promise<NewsletterResult> => {
  const { email, source, website } = await readValidatedForm(event, newsletterSchema)
  if (website) return { alreadySubscribed: false }

  const user = await getSessionUser(event)
  const alreadySubscribed = await subscribe(event, email, source, user?.email === email ? user.id : null)
  return { alreadySubscribed }
})
