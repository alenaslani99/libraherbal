import type { AdminProductListItem } from '#shared/types/product'

// GET /api/admin/products — the whole catalog, hidden products too (a few dozen rows, filtered in the browser)
export default defineEventHandler(async (event): Promise<AdminProductListItem[]> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { results } = await useDb(event).prepare(`
    SELECT p.id, p.name, p.slug, p.weight_label, p.stock, p.is_active, p.updated_at,
           c.name AS category_name,
           cp.regular_price, cp.sale_price,
           (SELECT src FROM images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order, id LIMIT 1) AS image,
           EXISTS (SELECT 1 FROM popular_products WHERE product_id = p.id) AS popular,
           COALESCE(s.units_sold, 0) AS units_sold
    FROM products p
    JOIN categories c                    ON c.id = p.category_id
    LEFT JOIN v_product_current_price cp ON cp.product_id = p.id
    LEFT JOIN v_product_sales s          ON s.product_id = p.id
    ORDER BY c.id, p.name COLLATE NOCASE
  `).all<{
    id: number
    name: string
    slug: string
    weight_label: string | null
    stock: number
    is_active: number
    updated_at: string
    category_name: string
    regular_price: number | null
    sale_price: number | null
    image: string | null
    popular: number
    units_sold: number
  }>()

  // para → RSD; D1 dates are UTC
  return results.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    weight: row.weight_label ?? '',
    category: row.category_name,
    price: row.regular_price === null ? null : row.regular_price / 100,
    salePrice: row.sale_price === null ? null : row.sale_price / 100,
    stock: row.stock,
    image: row.image ?? '',
    isActive: row.is_active === 1,
    popular: row.popular === 1,
    unitsSold: row.units_sold,
    updatedAt: `${row.updated_at.replace(' ', 'T')}Z`,
  }))
})
