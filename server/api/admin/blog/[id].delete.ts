// DELETE /api/admin/blog/:id — product links go with it (ON DELETE CASCADE)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)

  const result = await useDb(event).prepare('DELETE FROM blog_posts WHERE id = ?1').bind(id).run()
  if (!result.meta.changes) throw createError({ statusCode: 404, message: 'Objava nije pronađena.' })

  setResponseStatus(event, 204)
  return null
})
