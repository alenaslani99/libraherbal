// DELETE /api/admin/catalog/purposes/:id — also takes it off the products that had it
// (product_purposes is ON DELETE RESTRICT, so the links go first, in the same batch)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const db = useDb(event)

  const [, deleted] = await db.batch([
    db.prepare('DELETE FROM product_purposes WHERE purpose_id = ?1').bind(id),
    db.prepare('DELETE FROM purposes WHERE id = ?1').bind(id),
  ])
  if (!deleted!.meta.changes) throw createError({ statusCode: 404, message: 'Svrha nije pronađena.' })

  return sendNoContent(event)
})
