import { z } from 'zod'
import type { Product } from '#shared/types/product'

// "sve" = no filter (the default the app leaves out of the URL)
const querySchema = z.object({
  vrsta: z.string().max(64).optional(),
  kategorija: z.string().max(64).optional(),
  sortiraj: z.enum(['popularnost', 'cena-rastuce', 'cena-opadajuce', 'naziv']).catch('popularnost'),
})

const orderBy = {
  'popularnost': 'v.units_sold DESC, v.name COLLATE NOCASE',
  'cena-rastuce': 'v.final_price ASC, v.name COLLATE NOCASE',
  'cena-opadajuce': 'v.final_price DESC, v.name COLLATE NOCASE',
  'naziv': 'v.name COLLATE NOCASE',
} as const

// GET /api/products?vrsta=med&kategorija=imunitet&sortiraj=cena-rastuce
export default defineEventHandler(async (event): Promise<Product[]> => {
  const query = await getValidatedQuery(event, querySchema.parse)
  const type = query.vrsta && query.vrsta !== 'sve' ? query.vrsta : null
  const purpose = query.kategorija && query.kategorija !== 'sve' ? query.kategorija : null

  // category filter includes subcategories (categories.parent_id)
  const { results } = await useDb(event).prepare(`
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
    ORDER BY ${orderBy[query.sortiraj]}
  `).bind(type, purpose).all<ProductCardRow>()

  return results.map(toProduct)
})
