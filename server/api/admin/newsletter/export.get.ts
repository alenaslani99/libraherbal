// GET /api/admin/newsletter/export — subscribed addresses as CSV (Excel, mailing tools).
// Starts with a BOM so Excel reads č/ć/š/ž right; values are quoted, quotes doubled.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { results } = await useDb(event).prepare(`
    SELECT email, source, created_at FROM newsletter_subscribers
    WHERE status = 'subscribed'
    ORDER BY created_at
  `).all<{ email: string, source: string, created_at: string }>()

  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`
  const lines = [
    'email,izvor,prijavljen',
    ...results.map(r => [r.email, r.source, r.created_at].map(cell).join(',')),
  ]

  const date = new Date().toISOString().slice(0, 10)
  setResponseHeaders(event, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="newsletter-${date}.csv"`,
    'Cache-Control': 'private, no-store',
  })
  return `﻿${lines.join('\r\n')}\r\n`
})
