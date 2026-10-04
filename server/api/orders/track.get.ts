import type { OrderStatus, OrderTracking } from '#shared/types/order'

// GET /api/orders/track?broj=LH-2026-48213907 — status and contents of one order, for /prati-porudzbinu.
// Anyone with the number may look, so the answer carries no personal data. Rate limited in the strict
// tier (00.ratelimit.ts), which together with 8 random digits makes guessing numbers pointless.
export default defineEventHandler(async (event): Promise<OrderTracking> => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const raw = getQuery(event).broj
  const orderNumber = typeof raw === 'string' ? normalizeOrderNumber(raw) : ''
  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) {
    throw createError({ statusCode: 400, message: 'Unesite broj porudžbine u formatu LH-2026-12345678.' })
  }

  const row = await useDb(event).prepare(`
    SELECT o.order_number, o.status, o.received_at, o.preparing_at, o.in_transit_at, o.delivered_at, o.cancelled_at,
           o.subtotal, o.shipping_cost, o.total,
           (SELECT json_group_array(json_object('name', i.product_name, 'quantity', i.quantity, 'lineTotal', i.line_total))
            FROM order_items i WHERE i.order_id = o.id) AS items
    FROM orders o
    WHERE o.order_number = ?1
  `).bind(orderNumber).first<{
    order_number: string
    status: OrderStatus
    received_at: string
    preparing_at: string | null
    in_transit_at: string | null
    delivered_at: string | null
    cancelled_at: string | null
    subtotal: number
    shipping_cost: number
    total: number
    items: string
  }>()

  if (!row) {
    throw createError({ statusCode: 404, message: 'Porudžbina sa ovim brojem nije pronađena. Proverite broj iz potvrde porudžbine.' })
  }

  // D1 stores 'YYYY-MM-DD HH:MM:SS' in UTC
  const iso = (value: string | null) => (value ? `${value.replace(' ', 'T')}Z` : null)

  // amounts are in para (1 RSD = 100), the response is in RSD
  return {
    orderNumber: row.order_number,
    status: row.status,
    dates: {
      received: iso(row.received_at),
      preparing: iso(row.preparing_at),
      in_transit: iso(row.in_transit_at),
      delivered: iso(row.delivered_at),
      cancelled: iso(row.cancelled_at),
    },
    items: (JSON.parse(row.items) as OrderTracking['items']).map(item => ({ ...item, lineTotal: item.lineTotal / 100 })),
    subtotal: row.subtotal / 100,
    shipping: row.shipping_cost / 100,
    total: row.total / 100,
  }
})
