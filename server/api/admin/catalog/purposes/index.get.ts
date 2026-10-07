import type { AdminPurpose } from '#shared/types/catalog'

// GET /api/admin/catalog/purposes — in filter order, with how many products use each
export default defineEventHandler(async (event): Promise<AdminPurpose[]> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { results } = await useDb(event).prepare(`
    SELECT pu.id, pu.name, pu.slug, COUNT(pp.product_id) AS product_count
    FROM purposes pu
    LEFT JOIN product_purposes pp ON pp.purpose_id = pu.id
    GROUP BY pu.id
    ORDER BY pu.sort_order, pu.name
  `).all<{ id: number, name: string, slug: string, product_count: number }>()

  return results.map(p => ({ id: p.id, name: p.name, slug: p.slug, productCount: p.product_count }))
})
