import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'
import type { AdminProductData } from '#shared/schemas/product'
import type { AdminProduct } from '#shared/types/product'

// D1 stores 'YYYY-MM-DD HH:MM:SS' in UTC; the admin API speaks ISO
const fromSql = (value: string | null) => (value ? `${value.replace(' ', 'T')}Z` : '')
const toSql = (iso: string) => (iso ? new Date(iso).toISOString().slice(0, 19).replace('T', ' ') : null)

interface ProductRow {
  id: number
  category_id: number
  name: string
  slug: string
  description: string | null
  usage_instructions: string | null
  nutrition_info: string | null
  weight_label: string | null
  stock: number
  is_active: number
  created_at: string
  updated_at: string
}

// The newest prices row (the price history's head), whether or not its sale is running now
interface PriceRow {
  price: number
  sale_price: number | null
  sale_starts_at: string | null
  sale_ends_at: string | null
}

const LATEST_PRICE = `
  SELECT price, sale_price, sale_starts_at, sale_ends_at FROM prices
  WHERE product_id = ?1 ORDER BY created_at DESC, id DESC LIMIT 1
`

// One product for the edit form; 404 if there is none
export async function loadAdminProduct(event: H3Event, id: number): Promise<AdminProduct> {
  const db = useDb(event)
  const [productRows, priceRows, imageRows, purposeRows, ingredientRows, recommendedRows, extraRows] = await db.batch([
    db.prepare('SELECT * FROM products WHERE id = ?1').bind(id),
    db.prepare(LATEST_PRICE).bind(id),
    db.prepare('SELECT src, alt_text FROM images WHERE product_id = ?1 ORDER BY is_primary DESC, sort_order, id').bind(id),
    db.prepare('SELECT purpose_id FROM product_purposes WHERE product_id = ?1').bind(id),
    db.prepare('SELECT ingredient_id FROM product_ingredients WHERE product_id = ?1 ORDER BY sort_order').bind(id),
    db.prepare('SELECT recommended_product_id FROM product_recommendations WHERE product_id = ?1 ORDER BY sort_order').bind(id),
    db.prepare(`
      SELECT EXISTS (SELECT 1 FROM popular_products WHERE product_id = ?1) AS popular,
             COALESCE((SELECT units_sold FROM v_product_sales WHERE product_id = ?1), 0) AS units_sold
    `).bind(id),
  ])

  const row = productRows!.results[0] as ProductRow | undefined
  if (!row) throw createError({ statusCode: 404, message: 'Proizvod nije pronađen.' })
  const price = priceRows!.results[0] as PriceRow | undefined
  const extra = extraRows!.results[0] as { popular: number, units_sold: number }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryId: row.category_id,
    weightLabel: row.weight_label ?? '',
    isActive: row.is_active === 1,
    popular: extra.popular === 1,
    description: row.description ?? '',
    usageInstructions: row.usage_instructions ?? '',
    nutritionInfo: row.nutrition_info ?? '',
    // para → RSD
    price: price ? price.price / 100 : null,
    salePrice: price?.sale_price != null ? price.sale_price / 100 : null,
    saleStartsAt: fromSql(price?.sale_starts_at ?? null),
    saleEndsAt: fromSql(price?.sale_ends_at ?? null),
    stock: row.stock,
    images: (imageRows!.results as { src: string, alt_text: string | null }[]).map(img => ({ src: img.src, alt: img.alt_text ?? '' })),
    purposeIds: (purposeRows!.results as { purpose_id: number }[]).map(r => r.purpose_id),
    ingredientIds: (ingredientRows!.results as { ingredient_id: number }[]).map(r => r.ingredient_id),
    recommendedIds: (recommendedRows!.results as { recommended_product_id: number }[]).map(r => r.recommended_product_id),
    unitsSold: extra.units_sold,
    createdAt: fromSql(row.created_at),
    updatedAt: fromSql(row.updated_at),
  }
}

// Create (no id) or update a product from the validated admin form; returns its id.
// Everything goes in one D1 batch (a transaction), so a failed save changes nothing.
// Related rows find the product by its slug, which is unique and already final in the same batch,
// so creating and updating share the same statements.
export async function saveAdminProduct(event: H3Event, data: AdminProductData, id?: number): Promise<number> {
  const db = useDb(event)

  const category = await db.prepare('SELECT id FROM categories WHERE id = ?1').bind(data.categoryId).first()
  if (!category) throw formError(400, { categoryId: 'Izabrana kategorija ne postoji.' })

  let lastPrice: PriceRow | null = null
  if (id !== undefined) {
    const exists = await db.prepare('SELECT id FROM products WHERE id = ?1').bind(id).first()
    if (!exists) throw createError({ statusCode: 404, message: 'Proizvod nije pronađen.' })
    lastPrice = await db.prepare(LATEST_PRICE).bind(id).first<PriceRow>()
  }

  const values = [
    data.categoryId, data.name, data.slug, data.description || null, data.usageInstructions || null,
    data.nutritionInfo || null, data.weightLabel || null, data.stock, data.isActive ? 1 : 0,
  ]
  const productStatement = id === undefined
    ? db.prepare(`
        INSERT INTO products (category_id, name, slug, description, usage_instructions, nutrition_info, weight_label, stock, is_active)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
      `).bind(...values)
    : db.prepare(`
        UPDATE products SET category_id = ?1, name = ?2, slug = ?3, description = ?4, usage_instructions = ?5,
          nutrition_info = ?6, weight_label = ?7, stock = ?8, is_active = ?9, updated_at = datetime('now')
        WHERE id = ?10
      `).bind(...values, id)

  try {
    await db.batch([productStatement, ...priceStatements(db, data, lastPrice), ...relatedStatements(db, data)])
  }
  catch (error) {
    if (String((error as Error)?.message).includes('UNIQUE constraint failed: products.slug')) {
      throw formError(409, { slug: 'Proizvod sa ovom adresom već postoji.' })
    }
    throw error
  }

  if (id !== undefined) return id
  const created = await db.prepare('SELECT id FROM products WHERE slug = ?1').bind(data.slug).first<{ id: number }>()
  return created!.id
}

// prices is a history: a new row only when something changed, so the old prices stay on record
function priceStatements(db: D1Database, data: AdminProductData, last: PriceRow | null) {
  const next: PriceRow = {
    price: data.price * 100,
    sale_price: data.salePrice === null ? null : data.salePrice * 100,
    sale_starts_at: data.salePrice === null ? null : toSql(data.saleStartsAt),
    sale_ends_at: data.salePrice === null ? null : toSql(data.saleEndsAt),
  }
  const unchanged = last
    && last.price === next.price
    && last.sale_price === next.sale_price
    && last.sale_starts_at === next.sale_starts_at
    && last.sale_ends_at === next.sale_ends_at
  if (unchanged) return []

  return [db.prepare(`
    INSERT INTO prices (product_id, price, sale_price, sale_starts_at, sale_ends_at)
    SELECT id, ?2, ?3, ?4, ?5 FROM products WHERE slug = ?1
  `).bind(data.slug, next.price, next.sale_price, next.sale_starts_at, next.sale_ends_at)]
}

// Purposes, ingredients, images and recommendations are replaced as a whole; unknown ids are skipped
function relatedStatements(db: D1Database, data: AdminProductData) {
  const pid = '(SELECT id FROM products WHERE slug = ?1)'
  return [
    db.prepare(`DELETE FROM product_purposes WHERE product_id = ${pid}`).bind(data.slug),
    ...data.purposeIds.map(purposeId => db.prepare(`
      INSERT INTO product_purposes (product_id, purpose_id)
      SELECT ${pid}, id FROM purposes WHERE id = ?2
    `).bind(data.slug, purposeId)),

    db.prepare(`DELETE FROM product_ingredients WHERE product_id = ${pid}`).bind(data.slug),
    ...data.ingredientIds.map((ingredientId, i) => db.prepare(`
      INSERT INTO product_ingredients (product_id, ingredient_id, sort_order)
      SELECT ${pid}, id, ?3 FROM ingredients WHERE id = ?2
    `).bind(data.slug, ingredientId, i + 1)),

    db.prepare(`DELETE FROM images WHERE product_id = ${pid}`).bind(data.slug),
    ...data.images.map((image, i) => db.prepare(`
      INSERT INTO images (product_id, src, alt_text, sort_order, is_primary)
      VALUES (${pid}, ?2, ?3, ?4, ?5)
    `).bind(data.slug, image.src, image.alt || null, i + 1, i === 0 ? 1 : 0)),

    db.prepare(`DELETE FROM product_recommendations WHERE product_id = ${pid}`).bind(data.slug),
    ...data.recommendedIds.map((recommendedId, i) => db.prepare(`
      INSERT INTO product_recommendations (product_id, recommended_product_id, sort_order)
      SELECT ${pid}, id, ?3 FROM products WHERE id = ?2 AND slug <> ?1
    `).bind(data.slug, recommendedId, i + 1)),

    // "Popularni artikli": a newly marked product goes to the end of the list, others keep their place
    data.popular
      ? db.prepare(`
          INSERT INTO popular_products (product_id, sort_order)
          SELECT ${pid}, COALESCE((SELECT MAX(sort_order) FROM popular_products), 0) + 1
          WHERE NOT EXISTS (SELECT 1 FROM popular_products WHERE product_id = ${pid})
        `).bind(data.slug)
      : db.prepare(`DELETE FROM popular_products WHERE product_id = ${pid}`).bind(data.slug),
  ]
}
