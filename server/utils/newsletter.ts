import type { H3Event } from 'h3'

// Adds (or re-adds) an address to the newsletter list. An existing address keeps its first
// source and date; one that had unsubscribed is subscribed again, since the person just asked.
export async function subscribe(event: H3Event, email: string, source: 'footer' | 'section' | 'register', userId: number | null) {
  await useDb(event).prepare(`
    INSERT INTO newsletter_subscribers (email, source, user_id) VALUES (?1, ?2, ?3)
    ON CONFLICT (email) DO UPDATE SET
      status = 'subscribed',
      unsubscribed_at = NULL,
      user_id = COALESCE(newsletter_subscribers.user_id, excluded.user_id),
      updated_at = datetime('now')
  `).bind(email, source, userId).run()
}
