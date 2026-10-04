import type { ProductDetail, ProductInfoSection } from '#shared/types/product'

// Same for every product, shown as the last accordion
const deliveryInfo: ProductInfoSection = {
  title: 'Dostava',
  body: 'Isporuka širom Srbije za 1–3 radna dana, plaćanje pouzećem. Besplatna dostava za porudžbine preko 4.000 RSD.',
}

// GET /api/products/:slug — 404 for unknown or inactive products
export default defineEventHandler(async (event): Promise<ProductDetail> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const db = useDb(event)

  const product = await db.prepare(`
    SELECT v.*, p.description, p.usage_instructions, p.nutrition_info,
           CASE WHEN cp.sale_price IS NOT NULL THEN cp.sale_ends_at END AS sale_ends_at
    FROM v_product_card v
    JOIN products p ON p.id = v.id
    LEFT JOIN v_product_current_price cp ON cp.product_id = v.id
    WHERE v.slug = ?1
  `).bind(slug).first<ProductCardRow & {
    description: string | null
    usage_instructions: string | null
    nutrition_info: string | null
    sale_ends_at: string | null
  }>()

  if (!product) {
    throw createError({ statusCode: 404, message: 'Proizvod nije pronađen' })
  }

  const [images, ingredients, purpose] = await db.batch([
    db.prepare('SELECT src, alt_text FROM images WHERE product_id = ?1 ORDER BY is_primary DESC, sort_order, id').bind(product.id),
    db.prepare(`
      SELECT i.name, i.description FROM product_ingredients pi
      JOIN ingredients i ON i.id = pi.ingredient_id
      WHERE pi.product_id = ?1
      ORDER BY pi.sort_order
    `).bind(product.id),
    db.prepare(`
      SELECT pu.name FROM product_purposes pp
      JOIN purposes pu ON pu.id = pp.purpose_id
      WHERE pp.product_id = ?1
      ORDER BY pu.sort_order
      LIMIT 1
    `).bind(product.id),
  ])

  const info: ProductInfoSection[] = [
    { title: 'Način upotrebe', body: product.usage_instructions ?? '' },
    { title: 'Nutritivna vrednost', body: product.nutrition_info ?? '' },
  ].filter(section => section.body)

  return {
    ...toProduct(product),
    categorySlug: product.category_slug,
    // D1 stores 'YYYY-MM-DD HH:MM:SS' in UTC
    saleEndsAt: product.sale_ends_at ? `${product.sale_ends_at.replace(' ', 'T')}Z` : null,
    purpose: (purpose!.results[0] as { name: string } | undefined)?.name ?? '',
    description: product.description ?? '',
    rating: product.rating_avg,
    reviewCount: product.rating_count,
    inStock: product.stock > 0,
    images: (images!.results as { src: string, alt_text: string | null }[])
      .map(img => ({ src: img.src, alt: img.alt_text ?? product.name })),
    info: [...info, deliveryInfo],
    ingredients: (ingredients!.results as { name: string, description: string | null }[])
      .map(i => ({ name: i.name, description: i.description ?? '' })),
  }
})
