import type { OrderHistoryItem, OrderStatus } from '#shared/types/order'

// GET /api/account/orders — the signed-in user's orders, newest first.
// Items are copied into order_items when ordering, so old orders keep their names and prices.
export default defineEventHandler(async (event): Promise<OrderHistoryItem[]> => {
  const user = await requireUser(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const { results } = await useDb(event).prepare(`
    SELECT o.order_number, o.status, o.received_at, o.total,
           (SELECT json_group_array(json_object('name', i.product_name, 'quantity', i.quantity, 'lineTotal', i.line_total))
            FROM order_items i WHERE i.order_id = o.id) AS items
    FROM orders o
    WHERE o.user_id = ?1
    ORDER BY o.received_at DESC, o.id DESC
    LIMIT 100
  `).bind(user.id).all<{ order_number: string, status: OrderStatus, received_at: string, total: number, items: string }>()

  // amounts are in para (1 RSD = 100), the response is in RSD
  return results.map(row => ({
    orderNumber: row.order_number,
    status: row.status,
    placedAt: `${row.received_at.replace(' ', 'T')}Z`,
    total: row.total / 100,
    items: (JSON.parse(row.items) as OrderHistoryItem['items']).map(item => ({ ...item, lineTotal: item.lineTotal / 100 })),
  }))
})
