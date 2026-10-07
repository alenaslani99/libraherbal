import type { H3Event } from 'h3'
import type { OwnReview } from '#shared/types/engagement'

// SQL: 1 when the review's author has a non-cancelled order with this product.
// Used with the review table aliased as `r`.
export const VERIFIED_SQL = `EXISTS (
  SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id
  WHERE o.user_id = r.user_id AND oi.product_id = r.product_id AND o.status <> 'cancelled'
)`

// An active product by slug, or 404 (hidden products can't be reviewed or show reviews)
export async function reviewableProduct(event: H3Event, slug: string) {
  const product = await useDb(event).prepare('SELECT id FROM products WHERE slug = ?1 AND is_active = 1')
    .bind(slug).first<{ id: number }>()
  if (!product) throw createError({ statusCode: 404, message: 'Proizvod nije pronađen.' })
  return product.id
}

export async function ownReview(event: H3Event, productId: number, userId: number): Promise<OwnReview | null> {
  const row = await useDb(event).prepare(`
    SELECT rating, comment, is_approved, updated_at FROM reviews WHERE product_id = ?1 AND user_id = ?2
  `).bind(productId, userId).first<{ rating: number, comment: string | null, is_approved: number, updated_at: string }>()
  return row
    ? { rating: row.rating, comment: row.comment ?? '', approved: row.is_approved === 1, updatedAt: `${row.updated_at.replace(' ', 'T')}Z` }
    : null
}

// "Milica Petrović" → "Milica P."
export function shortName(first: string, last: string) {
  const initial = last.trim()[0]
  return initial ? `${first.trim()} ${initial.toUpperCase()}.` : first.trim()
}
