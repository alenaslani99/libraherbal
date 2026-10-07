// DELETE /api/admin/ingredients/:id — also takes it off the products that had it
// (product_ingredients is ON DELETE RESTRICT, so the links go first, in the same batch)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const db = useDb(event)

  const [, deleted] = await db.batch([
    db.prepare('DELETE FROM product_ingredients WHERE ingredient_id = ?1').bind(id),
    db.prepare('DELETE FROM ingredients WHERE id = ?1').bind(id),
  ])
  if (!deleted!.meta.changes) throw createError({ statusCode: 404, message: 'Sastojak nije pronađen.' })

  return sendNoContent(event)
})
