import { adminProductActiveSchema } from '#shared/schemas/product'

// PATCH /api/admin/products/:id — { isActive }: show or hide the product in the shop
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const { isActive } = await readValidatedForm(event, adminProductActiveSchema)

  const { meta } = await useDb(event).prepare(`
    UPDATE products SET is_active = ?1, updated_at = datetime('now') WHERE id = ?2
  `).bind(isActive ? 1 : 0, id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Proizvod nije pronađen.' })

  return { id, isActive }
})
