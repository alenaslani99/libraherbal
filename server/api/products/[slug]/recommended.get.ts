import type { Product } from '#shared/types/product'

// GET /api/products/:slug/recommended — the owner's picks for "Preporučeni proizvodi";
// when there are none, fills up with the best sellers from the same category
export default defineEventHandler(async (event): Promise<Product[]> => {
  const slug = getRouterParam(event, 'slug') ?? ''

  const { results } = await useDb(event).prepare(`
    WITH current AS (SELECT id, category_id FROM products WHERE slug = ?1)
    SELECT v.* FROM (
      SELECT pr.recommended_product_id AS id, 0 AS grp, pr.sort_order AS ord
      FROM product_recommendations pr JOIN current c ON pr.product_id = c.id
      UNION ALL
      SELECT p.id, 1, 0
      FROM products p JOIN current c ON p.category_id = c.category_id AND p.id <> c.id
    ) pick
    JOIN v_product_card v ON v.id = pick.id
    GROUP BY v.id
    ORDER BY MIN(pick.grp), MIN(pick.ord), v.units_sold DESC, v.name COLLATE NOCASE
    LIMIT 4
  `).bind(slug).all<ProductCardRow>()

  return results.map(toProduct)
})
