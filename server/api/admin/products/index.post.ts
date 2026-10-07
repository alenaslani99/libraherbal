import { adminProductSchema } from '#shared/schemas/product'

// POST /api/admin/products — create a product; answers with its id (the form then switches to /admin/proizvodi/:id)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await readValidatedForm(event, adminProductSchema)
  const id = await saveAdminProduct(event, data)
  setResponseStatus(event, 201)
  return { id }
})
