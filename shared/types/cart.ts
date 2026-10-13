// One line in the cart — one product with a quantity.
// Name, price and image are a snapshot for display; the backend re-prices the cart (POST /api/cart/quote).
export interface CartItem {
  productId: number
  slug: string
  name: string
  // "500g", "3 kom"
  weight: string
  // RSD per piece, e.g. 1290
  price: number
  image: string
  quantity: number
}

// POST /api/cart/quote body: only ids + quantities, the server looks up current prices itself
export interface CartQuoteRequest {
  items: { productId: number, quantity: number }[]
  // discount code typed on /placanje; omitted = no discount
  couponCode?: string
}

// Totals for the "Vaša korpa" box — what POST /api/cart/quote returns (amounts in RSD)
export interface CartSummary {
  itemCount: number
  subtotal: number
  // whole RSD off the subtotal; 0 = no code applied
  discount: number
  // the applied code; null = none sent, or it was rejected (see couponError)
  coupon: { code: string, percent: number } | null
  // why the sent code can't be used, shown under the field
  couponError: string | null
  // null = free shipping
  shipping: number | null
  total: number
  // amount still missing for free shipping, counted after the discount; null once reached
  remainingForFreeShipping: number | null
  // 0–1, fills the free-shipping bar
  freeShippingProgress: number
}
