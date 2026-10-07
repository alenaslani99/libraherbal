import { testimonialOrderSchema } from '#shared/schemas/engagement'

// PUT /api/admin/testimonials/order — { ids } in the new order; the home page shows the first 3 active
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { ids } = await readValidatedForm(event, testimonialOrderSchema)
  const db = useDb(event)

  await db.batch(ids.map((id, i) => db.prepare(`
    UPDATE testimonials SET sort_order = ?1, updated_at = datetime('now') WHERE id = ?2
  `).bind(i + 1, id)))

  return sendNoContent(event)
})
