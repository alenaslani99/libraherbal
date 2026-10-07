// Checkout contract — the body POST /api/orders will accept.

// Cash on delivery only for now; add card etc. here when supported
export type PaymentMethod = 'pouzece'

export interface ShippingDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  address: string
  postalCode: string
  // optional note for the courier / shop
  note: string
}

// What POST /api/orders answers with on success
export interface OrderConfirmation {
  // shown to the customer, e.g. "LH-2026-48213907"
  orderNumber: string
}

export interface OrderRequest {
  shipping: ShippingDetails
  paymentMethod: PaymentMethod
  // only ids + quantities: the server looks up current prices itself
  items: { productId: number, quantity: number }[]
}

export type OrderStatus = 'received' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled'

// GET /api/orders/track — an order looked up by its number on /prati-porudzbinu; amounts in RSD.
// No name, address or phone: the number alone is enough to see this, so it holds nothing personal.
export interface OrderTracking {
  orderNumber: string
  status: OrderStatus
  // ISO time each status was reached; null = not reached yet, or skipped by the shop
  dates: Record<OrderStatus, string | null>
  items: { name: string, quantity: number, lineTotal: number }[]
  subtotal: number
  // 0 = free shipping
  shipping: number
  total: number
}

// One order in "Istorija porudžbina" (GET /api/account/orders); amounts in RSD
export interface OrderHistoryItem {
  orderNumber: string
  status: OrderStatus
  // ISO date the order was placed
  placedAt: string
  total: number
  items: { name: string, quantity: number, lineTotal: number }[]
}

// ---------------------------------------------------------------------
//  Admin (/admin/porudzbine); amounts in RSD, dates ISO
// ---------------------------------------------------------------------

export interface AdminOrderListItem {
  id: number
  orderNumber: string
  status: OrderStatus
  placedAt: string
  customer: string
  city: string
  itemCount: number
  total: number
}

// GET /api/admin/orders — one page of orders plus how many there are per status (for the filter tabs)
export interface AdminOrderList {
  orders: AdminOrderListItem[]
  // orders matching status + search
  total: number
  page: number
  pageSize: number
  // per status for the current search; `all` = every status
  counts: Record<OrderStatus | 'all', number>
}

// GET /api/admin/orders/:id
export interface AdminOrder {
  id: number
  orderNumber: string
  status: OrderStatus
  dates: Record<OrderStatus, string | null>
  // null = guest checkout
  userId: number | null
  shipping: ShippingDetails
  items: { productId: number | null, name: string, unitPrice: number, regularPrice: number, quantity: number, lineTotal: number }[]
  subtotal: number
  // 0 = free shipping
  shippingCost: number
  total: number
  adminNote: string
  updatedAt: string
}
