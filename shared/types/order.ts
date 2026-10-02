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
  // shown to the customer, e.g. "LH-2481"
  orderNumber: string
}

export interface OrderRequest {
  shipping: ShippingDetails
  paymentMethod: PaymentMethod
  // only ids + quantities: the server looks up current prices itself
  items: { variantId: number, quantity: number }[]
}
