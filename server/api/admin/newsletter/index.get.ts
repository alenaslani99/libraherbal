import type { AdminSubscriber } from '#shared/types/engagement'

// GET /api/admin/newsletter — every address, newest first (filtered and paged in the browser)
export default defineEventHandler(async (event): Promise<AdminSubscriber[]> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { results } = await useDb(event).prepare(`
    SELECT id, email, source, status, created_at FROM newsletter_subscribers
    ORDER BY created_at DESC, id DESC
  `).all<{ id: number, email: string, source: AdminSubscriber['source'], status: AdminSubscriber['status'], created_at: string }>()

  return results.map(r => ({
    id: r.id,
    email: r.email,
    source: r.source,
    status: r.status,
    createdAt: `${r.created_at.replace(' ', 'T')}Z`,
  }))
})
