import type { H3Event } from 'h3'
import type { AdminOrder, OrderStatus } from '#shared/types/order'

// The happy path; 'cancelled' can follow any of these
export const ORDER_FLOW = ['received', 'preparing', 'in_transit', 'delivered'] as const

interface OrderRow {
  id: number
  order_number: string
  user_id: number | null
  status: OrderStatus
  received_at: string
  preparing_at: string | null
  in_transit_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  address: string
  postal_code: string
  note: string | null
  subtotal: number
  shipping_cost: number
  total: number
  admin_note: string | null
  updated_at: string
}

interface ItemRow {
  product_id: number | null
  product_name: string
  unit_price: number
  regular_price: number
  quantity: number
  line_total: number
}

// One order with its items for /admin/porudzbine/:id; 404 if there is none
export async function loadAdminOrder(event: H3Event, id: number): Promise<AdminOrder> {
  const db = useDb(event)
  const [orderRows, itemRows] = await db.batch([
    db.prepare('SELECT * FROM orders WHERE id = ?1').bind(id),
    db.prepare(`
      SELECT product_id, product_name, unit_price, regular_price, quantity, line_total
      FROM order_items WHERE order_id = ?1 ORDER BY id
    `).bind(id),
  ])
  const row = orderRows!.results[0] as OrderRow | undefined
  if (!row) throw createError({ statusCode: 404, message: 'Porudžbina nije pronađena.' })

  // D1 stores 'YYYY-MM-DD HH:MM:SS' in UTC; amounts are in para (1 RSD = 100), the response is in RSD
  const iso = (value: string | null) => (value ? `${value.replace(' ', 'T')}Z` : null)

  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    dates: {
      received: iso(row.received_at),
      preparing: iso(row.preparing_at),
      in_transit: iso(row.in_transit_at),
      delivered: iso(row.delivered_at),
      cancelled: iso(row.cancelled_at),
    },
    userId: row.user_id,
    shipping: {
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      city: row.city,
      address: row.address,
      postalCode: row.postal_code,
      note: row.note ?? '',
    },
    items: (itemRows!.results as ItemRow[]).map(item => ({
      productId: item.product_id,
      name: item.product_name,
      unitPrice: item.unit_price / 100,
      regularPrice: item.regular_price / 100,
      quantity: item.quantity,
      lineTotal: item.line_total / 100,
    })),
    subtotal: row.subtotal / 100,
    shippingCost: row.shipping_cost / 100,
    total: row.total / 100,
    adminNote: row.admin_note ?? '',
    updatedAt: iso(row.updated_at)!,
  }
}
