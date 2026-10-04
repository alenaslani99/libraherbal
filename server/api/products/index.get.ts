import { z } from 'zod'
import type { ProductPage } from '#shared/types/product'

// 12 fills whole rows in the 2 / 3 / 4 column grid
const PAGE_SIZE = 12

// "sve" = no filter (the default the app leaves out of the URL)
const querySchema = z.object({
  vrsta: z.string().max(64).optional(),
  kategorija: z.string().max(64).optional(),
  sortiraj: z.enum(['popularnost', 'cena-rastuce', 'cena-opadajuce', 'naziv']).catch('popularnost'),
  strana: z.coerce.number().int().min(1).catch(1),
})

const orderBy = {
  'popularnost': 'v.units_sold DESC, v.name COLLATE NOCASE',
  'cena-rastuce': 'v.final_price ASC, v.name COLLATE NOCASE',
  'cena-opadajuce': 'v.final_price DESC, v.name COLLATE NOCASE',
  'naziv': 'v.name COLLATE NOCASE',
} as const

// GET /api/products?vrsta=med&kategorija=imunitet&sortiraj=cena-rastuce&strana=2
// A page past the end comes back with no items but the real total, so the app can jump to the last page.
export default defineEventHandler(async (event): Promise<ProductPage> => {
  const query = await getValidatedQuery(event, querySchema.parse)
  const type = query.vrsta && query.vrsta !== 'sve' ? query.vrsta : null
  const purpose = query.kategorija && query.kategorija !== 'sve' ? query.kategorija : null
  const db = useDb(event)

  // category filter includes subcategories (categories.parent_id)
  const filtered = `
    WITH RECURSIVE tree(id) AS (
      SELECT id FROM categories WHERE ?1 IS NULL OR slug = ?1
      UNION
      SELECT c.id FROM categories c JOIN tree t ON c.parent_id = t.id
    )
    SELECT v.* FROM v_product_card v
    WHERE v.category_id IN (SELECT id FROM tree)
      AND (?2 IS NULL OR v.id IN (
        SELECT pp.product_id FROM product_purposes pp
        JOIN purposes pu ON pu.id = pp.purpose_id
        WHERE pu.slug = ?2))
  `

  // separate COUNT so a page past the end still knows the total
  const [count, rows] = await db.batch([
    db.prepare(`SELECT COUNT(*) AS total FROM (${filtered})`).bind(type, purpose),
    db.prepare(`${filtered} ORDER BY ${orderBy[query.sortiraj]} LIMIT ?3 OFFSET ?4`)
      .bind(type, purpose, PAGE_SIZE, (query.strana - 1) * PAGE_SIZE),
  ])

  const total = (count!.results[0] as { total: number } | undefined)?.total ?? 0

  return {
    items: (rows!.results as ProductCardRow[]).map(toProduct),
    total,
    page: query.strana,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  }
})
