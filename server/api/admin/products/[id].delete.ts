// DELETE /api/admin/products/:id — only for products nobody has ordered yet (test entries, mistakes).
// Ordered ones are hidden instead, so sales stats and "Popularni" keep their history.
// Prices, images, purposes, ingredients and recommendations go with it (ON DELETE CASCADE).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const db = useDb(event)

  const ordered = await db.prepare('SELECT 1 FROM order_items WHERE product_id = ?1 LIMIT 1').bind(id).first()
  if (ordered) {
    throw createError({ statusCode: 409, message: 'Ovaj proizvod je već poručivan, pa ne može da se obriše. Sakrijte ga umesto toga.' })
  }

  const { meta } = await db.prepare('DELETE FROM products WHERE id = ?1').bind(id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Proizvod nije pronađen.' })

  return sendNoContent(event)
})
