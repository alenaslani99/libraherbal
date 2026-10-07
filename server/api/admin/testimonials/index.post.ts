import { testimonialSchema } from '#shared/schemas/engagement'

// POST /api/admin/testimonials — a new one goes to the end of the list
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { author, text, rating, isActive } = await readValidatedForm(event, testimonialSchema)

  const row = await useDb(event).prepare(`
    INSERT INTO testimonials (author, text, rating, is_active, sort_order)
    VALUES (?1, ?2, ?3, ?4, COALESCE((SELECT MAX(sort_order) FROM testimonials), 0) + 1)
    RETURNING id
  `).bind(author, text, rating, isActive ? 1 : 0).first<{ id: number }>()

  setResponseStatus(event, 201)
  return { id: row!.id }
})
