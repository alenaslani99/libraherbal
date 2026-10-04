import type { Product } from '#shared/types/product'

// GET /api/products/popular — the owner's picks for "Popularni artikli" on the home page
export default defineEventHandler(async (event): Promise<Product[]> => {
  const { results } = await useDb(event).prepare(`
    SELECT v.* FROM popular_products pp
    JOIN v_product_card v ON v.id = pp.product_id
    ORDER BY pp.sort_order
    LIMIT 4
  `).all<ProductCardRow>()

  return results.map(toProduct)
})
