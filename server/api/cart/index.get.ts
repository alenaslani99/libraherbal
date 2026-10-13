import type { CartItem } from '#shared/types/cart'

// GET /api/cart — the signed-in user's saved cart, with current names, prices and images.
// Products that are gone (deleted, inactive, no price) are left out.
export default defineEventHandler(async (event): Promise<CartItem[]> => {
  const user = await requireUser(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { results } = await useDb(event).prepare(`
    SELECT p.*, i.quantity
    FROM carts c
    JOIN cart_items i ON i.cart_id = c.id
    JOIN v_product_card p ON p.id = i.product_id
    WHERE c.user_id = ?1 AND p.final_price IS NOT NULL
    ORDER BY i.created_at, i.product_id
  `).bind(user.id).all<ProductCardRow & { quantity: number }>()

  return results.map((row) => {
    const product = toProduct(row)
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      weight: product.weight,
      price: product.price,
      image: product.image,
      quantity: row.quantity,
    }
  })
})
