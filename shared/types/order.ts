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
