import { reviewApprovalSchema } from '#shared/schemas/engagement'

// PATCH /api/admin/reviews/:id — { approved }: show the review on the product page or take it down.
// Only approved reviews count in the stars and in Google's rating (v_product_rating).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const { approved } = await readValidatedForm(event, reviewApprovalSchema)

  // updated_at stays: it is when the customer last wrote the review
  const { meta } = await useDb(event).prepare('UPDATE reviews SET is_approved = ?1 WHERE id = ?2')
    .bind(approved ? 1 : 0, id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Recenzija nije pronađena.' })

  return { id, approved }
})
