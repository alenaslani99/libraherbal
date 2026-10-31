// dataLayer events for Google Tag Manager, in GA4 ecommerce format ("Libra Herbal – dataLayer specifikacija").
// The tags (GA4, Meta, Clarity) are set up in GTM; the site only sends the data.
// Event and field names must stay exactly as they are. Never put the customer's name, email, phone or address here.

// One product in `items`, the same shape in every event
export interface AnalyticsItem {
  item_id: string
  item_name: string
  item_category: string
  item_variant?: string
  // RSD per piece, after any promotion
  price: number
  quantity: number
  // RSD off per piece while on promotion
  discount?: number
}

// What a product looks like wherever it's tracked from: Product, ProductDetail, CartItem, an order line
interface TrackedProduct {
  slug: string
  name: string
  category?: string
  weight?: string
  price: number
  regularPrice?: number
}

function push(data: Record<string, unknown>) {
  if (import.meta.server) return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(data)
}

export function analyticsItem(product: TrackedProduct, quantity: number): AnalyticsItem {
  const discount = product.regularPrice && product.regularPrice > product.price ? product.regularPrice - product.price : 0
  return {
    item_id: product.slug,
    item_name: product.name,
    // carts saved before tracking was added have no category
    item_category: product.category ?? '',
    ...(product.weight ? { item_variant: product.weight } : {}),
    price: product.price,
    quantity,
    ...(discount ? { discount } : {}),
  }
}

export function itemsValue(items: AnalyticsItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// Clears the previous ecommerce object first, otherwise GTM merges the data of two events
export function trackEcommerce(event: string, ecommerce: { items: AnalyticsItem[], value?: number } & Record<string, unknown>) {
  push({ ecommerce: null })
  push({ event, ecommerce: { currency: 'RSD', value: itemsValue(ecommerce.items), ...ecommerce } })
}

export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  push({ event, ...params })
}
