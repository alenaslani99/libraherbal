import { adminProductSchema } from '#shared/schemas/product'

// PUT /api/admin/products/:id — save the whole form; answers with the saved product
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const data = await readValidatedForm(event, adminProductSchema)
  await saveAdminProduct(event, data, id)
  return loadAdminProduct(event, id)
})
