import type { Testimonial } from '#shared/types/engagement'

// GET /api/testimonials — "Uspešne priče" on the home page: the first 3 active, in the admin's order
export default defineEventHandler(async (event): Promise<Testimonial[]> => {
  const { results } = await useDb(event).prepare(`
    SELECT id, author, text, rating FROM testimonials
    WHERE is_active = 1
    ORDER BY sort_order, id
    LIMIT 3
  `).all<Testimonial>()
  return results
})
