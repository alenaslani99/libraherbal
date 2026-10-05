import { z } from 'zod'
import type { Product } from '#shared/types/product'

const querySchema = z.object({
  slugs: z.string().max(400).transform(value => [...new Set(value.split(',').map(s => s.trim()).filter(Boolean))].slice(0, 6)),
})

// GET /api/products/by-slugs?slugs=gvozdje-med,imuno-med — product cards in the given order
// (blog "Preporučeni proizvodi"). Unknown or inactive slugs are skipped.
export default defineEventHandler(async (event): Promise<Product[]> => {
  const { slugs } = await getValidatedQuery(event, querySchema.parse)
  if (!slugs.length) return []

  const { results } = await useDb(event).prepare(`
    SELECT v.* FROM v_product_card v
    WHERE v.slug IN (${slugs.map(() => '?').join(', ')})
  `).bind(...slugs).all<ProductCardRow>()

  const bySlug = new Map(results.map(row => [row.slug, toProduct(row)]))
  return slugs.flatMap(slug => bySlug.get(slug) ?? [])
})
