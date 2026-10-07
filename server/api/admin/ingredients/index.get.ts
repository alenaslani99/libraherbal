import type { AdminIngredient } from '#shared/types/catalog'

// GET /api/admin/ingredients — every ingredient with the products that use it
export default defineEventHandler(async (event): Promise<AdminIngredient[]> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { results } = await useDb(event).prepare(`
    SELECT i.id, i.name, i.description,
           (SELECT json_group_array(p.name) FROM product_ingredients pi
            JOIN products p ON p.id = pi.product_id
            WHERE pi.ingredient_id = i.id) AS products
    FROM ingredients i
    ORDER BY i.name COLLATE NOCASE
  `).all<{ id: number, name: string, description: string | null, products: string }>()

  return results.map(i => ({
    id: i.id,
    name: i.name,
    description: i.description ?? '',
    products: JSON.parse(i.products) as string[],
  }))
})
