import type { DashboardBucket, DashboardData, DashboardDays, DashboardKpis } from '#shared/types/dashboard'
import type { OrderStatus } from '#shared/types/order'

const TZ = 'Europe/Belgrade'
const PERIODS: DashboardDays[] = [7, 30, 90]

// ----- Serbian calendar days (the Worker runs in UTC) --------------------------------------
const belgradeDate = (ms: number) => new Date(ms).toLocaleDateString('sv-SE', { timeZone: TZ })

function addDays(date: string, n: number) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, d! + n)).toISOString().slice(0, 10)
}

// UTC instant of 00:00 in Belgrade on `date` (DST-aware: the offset is read for that day)
function belgradeMidnight(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  const guess = Date.UTC(y!, m! - 1, d!)
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
  }).formatToParts(guess).map(p => [p.type, Number(p.value)]))
  const wallClock = Date.UTC(parts.year!, parts.month! - 1, parts.day!, parts.hour!, parts.minute!)
  return guess - (wallClock - guess)
}

const toSql = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ')
const fromSql = (value: string) => Date.parse(`${value.replace(' ', 'T')}Z`)

// Monday of the week `date` is in
function monday(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  const weekday = (new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay() + 6) % 7
  return addDays(date, -weekday)
}

function kpis(revenue: number, orders: number, cancelled: number): DashboardKpis {
  return { revenue, orders, avgOrder: orders ? Math.round(revenue / orders) : 0, cancelled }
}

// GET /api/admin/dashboard?days=7|30|90 — numbers for /admin. A period is the last N days
// including today; "previous" is the N days before it, for the comparison arrows.
export default defineEventHandler(async (event): Promise<DashboardData> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const asked = Number(getQuery(event).days)
  const days = PERIODS.includes(asked as DashboardDays) ? asked as DashboardDays : 30

  const today = belgradeDate(Date.now())
  const currentStart = addDays(today, -(days - 1))
  const previousStart = addDays(today, -(2 * days - 1))

  const db = useDb(event)
  const [orderRows, topRows, recentRows, todoRows] = await db.batch([
    db.prepare('SELECT received_at, status, total FROM orders WHERE received_at >= ?1')
      .bind(toSql(belgradeMidnight(previousStart))),
    db.prepare(`
      SELECT oi.product_id, oi.product_name, SUM(oi.quantity) AS units, SUM(oi.line_total) AS revenue
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status <> 'cancelled' AND o.received_at >= ?1
      GROUP BY COALESCE(oi.product_id, -1), oi.product_name
      ORDER BY units DESC, revenue DESC
      LIMIT 5
    `).bind(toSql(belgradeMidnight(currentStart))),
    db.prepare(`
      SELECT o.id, o.order_number, o.status, o.received_at, o.first_name, o.last_name, o.city, o.total,
             (SELECT COALESCE(SUM(i.quantity), 0) FROM order_items i WHERE i.order_id = o.id) AS item_count
      FROM orders o
      ORDER BY o.received_at DESC, o.id DESC
      LIMIT 5
    `),
    db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM orders WHERE status = 'received') AS received,
        (SELECT COUNT(*) FROM orders WHERE status = 'preparing') AS preparing,
        (SELECT COUNT(*) FROM contact_messages WHERE status = 'new') AS new_messages,
        (SELECT COUNT(*) FROM products p
          LEFT JOIN v_product_current_price cp ON cp.product_id = p.id
          WHERE p.is_active = 1
            AND (cp.regular_price IS NULL OR p.stock = 0
                 OR NOT EXISTS (SELECT 1 FROM images WHERE product_id = p.id))) AS product_problems,
        (SELECT COUNT(*) FROM ingredients
          WHERE description IS NULL OR trim(description) = '' OR description LIKE 'Lorem ipsum%') AS ingredients_missing
    `),
  ])

  // ----- totals and chart buckets ---------------------------------------------------------
  const weekly = days === 90
  const bucketKey = (date: string) => (weekly ? monday(date) : date)
  const buckets = new Map<string, DashboardBucket>()
  for (let date = bucketKey(currentStart); date <= today; date = addDays(date, weekly ? 7 : 1)) {
    const start = date < currentStart ? currentStart : date
    const end = weekly ? addDays(date, 6) : date
    buckets.set(date, { date: start, endDate: end > today ? today : end, revenue: 0, orders: 0 })
  }

  const totals = { current: { revenue: 0, orders: 0, cancelled: 0 }, previous: { revenue: 0, orders: 0, cancelled: 0 } }
  for (const row of orderRows!.results as { received_at: string, status: OrderStatus, total: number }[]) {
    const date = belgradeDate(fromSql(row.received_at))
    if (date < previousStart) continue
    const period = date >= currentStart ? totals.current : totals.previous
    if (row.status === 'cancelled') {
      period.cancelled++
      continue
    }
    period.revenue += row.total
    period.orders++
    if (period === totals.current) {
      const bucket = buckets.get(bucketKey(date))
      if (bucket) {
        bucket.revenue += row.total
        bucket.orders++
      }
    }
  }

  const todo = todoRows!.results[0] as {
    received: number
    preparing: number
    new_messages: number
    product_problems: number
    ingredients_missing: number
  }

  // amounts are in para (1 RSD = 100), the response is in RSD
  return {
    days,
    current: kpis(totals.current.revenue / 100, totals.current.orders, totals.current.cancelled),
    previous: kpis(totals.previous.revenue / 100, totals.previous.orders, totals.previous.cancelled),
    buckets: [...buckets.values()].map(b => ({ ...b, revenue: b.revenue / 100 })),
    todo: {
      received: todo.received,
      preparing: todo.preparing,
      newMessages: todo.new_messages,
      productProblems: todo.product_problems,
      ingredientsMissing: todo.ingredients_missing,
    },
    recentOrders: (recentRows!.results as {
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
    topProducts: (topRows!.results as { product_id: number | null, product_name: string, units: number, revenue: number }[])
      .map(row => ({ productId: row.product_id, name: row.product_name, units: row.units, revenue: row.revenue / 100 })),
  }
})
