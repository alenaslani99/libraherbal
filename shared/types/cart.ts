// One line in the cart — one product variant (size) with a quantity.
// Name, price and image are a snapshot for display; the backend re-prices the cart at checkout.
export interface CartItem {
  variantId: number
  slug: string
  name: string
  // "500 g", "100g"
  variantLabel: string
  // display price per piece as the backend sends it, e.g. "1.290"
  price: string
  image: string
  quantity: number
}

// Totals for the "Vaša korpa" box — the shape a cart quote endpoint will return (display strings)
export interface CartSummary {
  itemCount: number
  subtotal: string
  // null = free shipping
  shipping: string | null
  total: string
  // amount still missing for free shipping; null once reached
  remainingForFreeShipping: string | null
  // 0–1, fills the free-shipping bar
  freeShippingProgress: number
}
