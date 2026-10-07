import { purposeOrderSchema } from '#shared/schemas/catalog'

// PUT /api/admin/catalog/purposes/order — { ids } in the new order. It is the order of the
// "Svrha" filter on /proizvodi, and a product's first purpose is the eyebrow above its name.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { ids } = await readValidatedForm(event, purposeOrderSchema)
  const db = useDb(event)

  await db.batch(ids.map((id, i) => db.prepare(`
    UPDATE purposes SET sort_order = ?1, updated_at = datetime('now') WHERE id = ?2
  `).bind(i + 1, id)))

  return sendNoContent(event)
})
