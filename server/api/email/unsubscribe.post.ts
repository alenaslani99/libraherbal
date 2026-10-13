// POST /api/email/unsubscribe?t=<token> — stops reminder emails (abandoned cart, viewed products).
// Called by the /odjava-podsetnika page and by mail apps' own "Unsubscribe" button (List-Unsubscribe-Post,
// RFC 8058: they POST to this URL without a session or Origin). POST only, so link scanners that open
// every URL in an email can't unsubscribe anyone. Always 204: the answer doesn't tell whether a token exists.
export default defineEventHandler(async (event) => {
  setResponseStatus(event, 204)
  const token = getQuery(event).t
  if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) return

  await useDb(event).prepare(`
    UPDATE users SET reminder_emails = 0, updated_at = datetime('now')
    WHERE unsubscribe_token = ?1 AND reminder_emails = 1
  `).bind(token).run()
})
