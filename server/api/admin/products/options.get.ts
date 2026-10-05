import type { AdminProductOption } from '#shared/types/blog'

// GET /api/admin/products/options — every product (inactive too) for pickers in admin forms
export default defineEventHandler(async (event): Promise<AdminProductOption[]> => {
  await requireAdmin(event)

  const { results } = await useDb(event).prepare(`
    SELECT id, name, weight_label, is_active FROM products ORDER BY name COLLATE NOCASE
  `).all<{ id: number, name: string, weight_label: string | null, is_active: number }>()

  return results.map(p => ({ id: p.id, name: p.name, weight: p.weight_label ?? '', isActive: p.is_active === 1 }))
})
