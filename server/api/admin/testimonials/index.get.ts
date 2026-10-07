import type { AdminTestimonial } from '#shared/types/engagement'

// GET /api/admin/testimonials — all, in display order (the first 3 active ones are on the home page)
export default defineEventHandler(async (event): Promise<AdminTestimonial[]> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { results } = await useDb(event).prepare(`
    SELECT id, author, text, rating, is_active FROM testimonials ORDER BY sort_order, id
  `).all<{ id: number, author: string, text: string, rating: number, is_active: number }>()

  return results.map(t => ({ id: t.id, author: t.author, text: t.text, rating: t.rating, isActive: t.is_active === 1 }))
})
