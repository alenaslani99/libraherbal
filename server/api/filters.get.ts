import type { CatalogFilters } from '#shared/types/product'

// GET /api/filters — options for the /proizvodi sidebar
export default defineEventHandler(async (event): Promise<CatalogFilters> => {
  const db = useDb(event)
  const [types, purposes] = await db.batch<{ value: string, label: string }>([
    db.prepare('SELECT slug AS value, name AS label FROM categories WHERE is_active = 1 AND parent_id IS NULL ORDER BY id'),
    db.prepare('SELECT slug AS value, name AS label FROM purposes ORDER BY sort_order, name'),
  ])

  return { types: types!.results, purposes: purposes!.results }
})
