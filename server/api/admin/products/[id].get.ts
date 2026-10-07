import type { AdminProduct } from '#shared/types/product'

// GET /api/admin/products/:id — a product for the edit form, hidden ones included
export default defineEventHandler(async (event): Promise<AdminProduct> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return loadAdminProduct(event, routeId(event))
})
