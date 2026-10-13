// Shipping rules in para (1 RSD = 100). Shared: checkout (server) and product SEO / schema (app)
export const FREE_SHIPPING_FROM = 4000_00
export const SHIPPING_PRICE = 350_00

export function shippingFor(subtotal: number) {
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_PRICE
}
