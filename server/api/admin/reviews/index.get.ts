import type { AdminReview } from '#shared/types/engagement'

// GET /api/admin/reviews — every review, waiting ones first, then newest (filtered and paged in the browser)
export default defineEventHandler(async (event): Promise<AdminReview[]> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { results } = await useDb(event).prepare(`
    SELECT r.id, r.rating, r.comment, r.is_approved, r.created_at, r.updated_at, ${VERIFIED_SQL} AS verified,
           p.id AS product_id, p.name AS product_name, p.slug AS product_slug,
           u.first_name, u.last_name, u.email
    FROM reviews r
    JOIN products p ON p.id = r.product_id
    JOIN users u ON u.id = r.user_id
    ORDER BY r.is_approved, r.updated_at DESC, r.id DESC
  `).all<{
    id: number
    rating: number
    comment: string | null
    is_approved: number
    created_at: string
    updated_at: string
    verified: number
    product_id: number
    product_name: string
    product_slug: string
    first_name: string
    last_name: string
    email: string
  }>()

  const iso = (value: string) => `${value.replace(' ', 'T')}Z`
  return results.map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment ?? '',
    approved: r.is_approved === 1,
    verified: r.verified === 1,
    productId: r.product_id,
    productName: r.product_name,
    productSlug: r.product_slug,
    userName: `${r.first_name} ${r.last_name}`.trim(),
    userEmail: r.email,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  }))
})
