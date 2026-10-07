import type { AdminOrder } from '#shared/types/order'

// GET /api/admin/orders/:id — the whole order: customer, address, items, status dates, internal note
export default defineEventHandler(async (event): Promise<AdminOrder> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return loadAdminOrder(event, routeId(event))
})
