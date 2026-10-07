import type { AdminOrderList, OrderStatus } from '#shared/types/order'

const PAGE_SIZE = 25
const STATUSES: OrderStatus[] = ['received', 'preparing', 'in_transit', 'delivered', 'cancelled']

// GET /api/admin/orders?status=received&q=petrović&page=2 — newest first, 25 per page.
// q matches the order number, name, email or phone; the per-status counts follow q, not status.
export default defineEventHandler(async (event): Promise<AdminOrderList> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const query = getQuery(event)
  const status = STATUSES.includes(query.status as OrderStatus) ? query.status as OrderStatus : ''
  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''
  const page = Math.max(1, Math.min(10_000, Number.parseInt(String(query.page ?? 1), 10) || 1))

  // LIKE pattern with % and _ taken literally; phones are also compared without spaces and dashes
  const like = q ? `%${q.replace(/[\\%_]/g, '\\$&')}%` : ''
  const digits = q.replace(/[\s\-/]/g, '')
  const phoneLike = /^\+?\d{3,}$/.test(digits) ? `%${digits}%` : ''

  const search = `(?1 = '' OR o.order_number LIKE ?1 ESCAPE '\\' OR (o.first_name || ' ' || o.last_name) LIKE ?1 ESCAPE '\\'
                   OR o.email LIKE ?1 ESCAPE '\\' OR o.phone LIKE ?1 ESCAPE '\\'
                   OR (?2 <> '' AND replace(replace(o.phone, ' ', ''), '-', '') LIKE ?2))`

  const db = useDb(event)
  const [rows, counts] = await db.batch([
    db.prepare(`
      SELECT o.id, o.order_number, o.status, o.received_at, o.first_name, o.last_name, o.city, o.total,
             (SELECT COALESCE(SUM(i.quantity), 0) FROM order_items i WHERE i.order_id = o.id) AS item_count
      FROM orders o
      WHERE ${search} AND (?3 = '' OR o.status = ?3)
      ORDER BY o.received_at DESC, o.id DESC
      LIMIT ?4 OFFSET ?5
    `).bind(like, phoneLike, status, PAGE_SIZE, (page - 1) * PAGE_SIZE),
    db.prepare(`SELECT o.status, COUNT(*) AS n FROM orders o WHERE ${search} GROUP BY o.status`).bind(like, phoneLike),
  ])

  const perStatus = Object.fromEntries(STATUSES.map(s => [s, 0])) as Record<OrderStatus, number>
  for (const row of counts!.results as { status: OrderStatus, n: number }[]) perStatus[row.status] = row.n
  const all = STATUSES.reduce((sum, s) => sum + perStatus[s], 0)

  // amounts are in para (1 RSD = 100), the response is in RSD; D1 dates are UTC
  return {
    orders: (rows!.results as {
      id: number
      order_number: string
      status: OrderStatus
      received_at: string
      first_name: string
      last_name: string
      city: string
      total: number
      item_count: number
    }[]).map(row => ({
      id: row.id,
      orderNumber: row.order_number,
      status: row.status,
      placedAt: `${row.received_at.replace(' ', 'T')}Z`,
      customer: `${row.first_name} ${row.last_name}`,
      city: row.city,
      itemCount: row.item_count,
      total: row.total / 100,
    })),
    total: status ? perStatus[status] : all,
    page,
    pageSize: PAGE_SIZE,
    counts: { all, ...perStatus },
  }
})
