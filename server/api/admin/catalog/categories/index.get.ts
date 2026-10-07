import type { AdminCategory } from '#shared/types/catalog'

// GET /api/admin/catalog/categories — with how many products each has (all / shown in the shop)
export default defineEventHandler(async (event): Promise<AdminCategory[]> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { results } = await useDb(event).prepare(`
    SELECT c.id, c.name, c.slug,
           COUNT(p.id) AS product_count,
           COALESCE(SUM(p.is_active), 0) AS active_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.id
  `).all<{ id: number, name: string, slug: string, product_count: number, active_count: number }>()

  return results.map(c => ({ id: c.id, name: c.name, slug: c.slug, productCount: c.product_count, activeCount: c.active_count }))
})
