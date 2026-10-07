import { testimonialSchema } from '#shared/schemas/engagement'

// PUT /api/admin/testimonials/:id — the whole testimonial (also used to show/hide it)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const { author, text, rating, isActive } = await readValidatedForm(event, testimonialSchema)

  const { meta } = await useDb(event).prepare(`
    UPDATE testimonials SET author = ?1, text = ?2, rating = ?3, is_active = ?4, updated_at = datetime('now')
    WHERE id = ?5
  `).bind(author, text, rating, isActive ? 1 : 0, id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Utisak nije pronađen.' })

  return { id }
})
