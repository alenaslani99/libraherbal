// DELETE /api/admin/newsletter/:id — removes the address for good (e.g. on the person's request)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)

  const { meta } = await useDb(event).prepare('DELETE FROM newsletter_subscribers WHERE id = ?1').bind(id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Adresa nije pronađena.' })

  return sendNoContent(event)
})
