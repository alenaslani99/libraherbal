import type { AdminCatalogOptions } from '#shared/types/product'

// GET /api/admin/catalog/options — categories, purposes and ingredients for the product form
export default defineEventHandler(async (event): Promise<AdminCatalogOptions> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const db = useDb(event)
  const [categories, purposes, ingredients] = await db.batch([
    db.prepare('SELECT id, name, is_active FROM categories ORDER BY id'),
    db.prepare('SELECT id, name FROM purposes ORDER BY sort_order, name'),
    db.prepare('SELECT id, name FROM ingredients ORDER BY name COLLATE NOCASE'),
  ])

  return {
    categories: (categories!.results as { id: number, name: string, is_active: number }[])
      .map(c => ({ id: c.id, name: c.name, isActive: c.is_active === 1 })),
    purposes: purposes!.results as { id: number, name: string }[],
    ingredients: ingredients!.results as { id: number, name: string }[],
  }
})
