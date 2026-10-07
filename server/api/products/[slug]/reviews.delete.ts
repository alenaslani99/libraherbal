// DELETE /api/products/:slug/reviews — the signed-in customer removes their own review
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const productId = await reviewableProduct(event, getRouterParam(event, 'slug') ?? '')

  const { meta } = await useDb(event).prepare('DELETE FROM reviews WHERE product_id = ?1 AND user_id = ?2')
    .bind(productId, user.id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Recenzija nije pronađena.' })

  return sendNoContent(event)
})
