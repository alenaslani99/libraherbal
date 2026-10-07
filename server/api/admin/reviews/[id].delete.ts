// DELETE /api/admin/reviews/:id — removes a review for good (spam, abuse)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)

  const { meta } = await useDb(event).prepare('DELETE FROM reviews WHERE id = ?1').bind(id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Recenzija nije pronađena.' })

  return sendNoContent(event)
})
