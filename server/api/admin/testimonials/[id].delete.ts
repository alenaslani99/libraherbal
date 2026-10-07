// DELETE /api/admin/testimonials/:id
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)

  const { meta } = await useDb(event).prepare('DELETE FROM testimonials WHERE id = ?1').bind(id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Utisak nije pronađen.' })

  return sendNoContent(event)
})
