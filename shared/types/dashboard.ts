import type { AdminOrderListItem } from './order'

// GET /api/admin/dashboard?days=30 — /admin "Pregled". Amounts in RSD; days are Serbian calendar days.

export type DashboardDays = 7 | 30 | 90

export interface DashboardKpis {
  // sum of order totals (shipping included), cancelled orders left out
  revenue: number
  orders: number
  // revenue / orders, rounded; 0 without orders
  avgOrder: number
  cancelled: number
}

// one column of the chart: a day (7/30) or a week (90, `date` = its Monday)
export interface DashboardBucket {
  // 'YYYY-MM-DD'
  date: string
  // last day of a week bucket; same as `date` for days
  endDate: string
  revenue: number
  orders: number
}

export interface DashboardData {
  days: DashboardDays
  current: DashboardKpis
  // the same number of days right before
  previous: DashboardKpis
  buckets: DashboardBucket[]
  // what needs a look now (not tied to the period)
  todo: {
    received: number
    preparing: number
    newMessages: number
    pendingReviews: number
    productProblems: number
    ingredientsMissing: number
  }
  recentOrders: AdminOrderListItem[]
  topProducts: { productId: number | null, name: string, units: number, revenue: number }[]
}
