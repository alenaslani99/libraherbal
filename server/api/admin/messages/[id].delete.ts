// DELETE /api/admin/messages/:id — removes a message for good (spam, handled long ago)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)

  const { meta } = await useDb(event).prepare('DELETE FROM contact_messages WHERE id = ?1').bind(id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Poruka nije pronađena.' })

  return sendNoContent(event)
})
