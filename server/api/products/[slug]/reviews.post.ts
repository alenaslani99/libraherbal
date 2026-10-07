import { reviewSchema } from '#shared/schemas/engagement'
import type { OwnReview } from '#shared/types/engagement'

// POST /api/products/:slug/reviews — { rating, comment }; signed-in customers only.
// One review per customer and product: sending again edits it. A new or edited review
// waits for the admin's approval (/admin/recenzije) before it shows on the site.
export default defineEventHandler(async (event): Promise<OwnReview> => {
  const user = await requireUser(event)
  const productId = await reviewableProduct(event, getRouterParam(event, 'slug') ?? '')
  const { rating, comment } = await readValidatedForm(event, reviewSchema)

  await useDb(event).prepare(`
    INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?1, ?2, ?3, ?4)
    ON CONFLICT (product_id, user_id) DO UPDATE SET
      rating = excluded.rating,
      comment = excluded.comment,
      is_approved = 0,
      updated_at = datetime('now')
  `).bind(productId, user.id, rating, comment || null).run()

  return (await ownReview(event, productId, user.id))!
})
