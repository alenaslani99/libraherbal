import type { ProductReviews } from '#shared/types/engagement'

// GET /api/products/:slug/reviews — approved reviews (newest first, max 50), the star summary,
// and the signed-in customer's own review even while it waits for approval.
export default defineEventHandler(async (event): Promise<ProductReviews> => {
  const productId = await reviewableProduct(event, getRouterParam(event, 'slug') ?? '')
  const user = await getSessionUser(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const db = useDb(event)
  const [listRows, statRows] = await db.batch([
    db.prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.first_name, u.last_name, ${VERIFIED_SQL} AS verified
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ?1 AND r.is_approved = 1
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT 50
    `).bind(productId),
    db.prepare(`
      SELECT rating, COUNT(*) AS n FROM reviews WHERE product_id = ?1 AND is_approved = 1 GROUP BY rating
    `).bind(productId),
  ])

  const distribution: ProductReviews['distribution'] = [0, 0, 0, 0, 0]
  let sum = 0
  for (const row of statRows!.results as { rating: number, n: number }[]) {
    distribution[5 - row.rating] = row.n
    sum += row.rating * row.n
  }
  const count = distribution.reduce((a, b) => a + b, 0)

  return {
    reviews: (listRows!.results as { id: number, rating: number, comment: string | null, created_at: string, first_name: string, last_name: string, verified: number }[])
      .map(r => ({
        id: r.id,
        author: shortName(r.first_name, r.last_name),
        rating: r.rating,
        comment: r.comment ?? '',
        verified: r.verified === 1,
        createdAt: `${r.created_at.replace(' ', 'T')}Z`,
      })),
    // same rounding as v_product_rating (one decimal)
    average: count ? Math.round((sum / count) * 10) / 10 : 0,
    count,
    distribution,
    mine: user ? await ownReview(event, productId, user.id) : null,
  }
})
