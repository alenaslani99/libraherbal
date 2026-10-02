import type { CartSummary } from '#shared/types/cart'

const FREE_SHIPPING_FROM = 4000
const SHIPPING_PRICE = 350

// Mock-only number helpers: the backend will price the cart (e.g. POST /api/cart/quote) and return
// CartSummary with ready display strings, so the browser never computes what the customer pays.
const toNumber = (price: string) => Number(price.replace(/\./g, ''))
const toDisplay = (value: number) => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

export function useCartSummary() {
  const { items, count } = useCart()

  return computed<CartSummary>(() => {
    const subtotal = items.value.reduce((sum, item) => sum + toNumber(item.price) * item.quantity, 0)
    const freeShipping = subtotal >= FREE_SHIPPING_FROM
    const shipping = freeShipping ? 0 : SHIPPING_PRICE

    return {
      itemCount: count.value,
      subtotal: toDisplay(subtotal),
      shipping: freeShipping ? null : toDisplay(shipping),
      total: toDisplay(subtotal + shipping),
      remainingForFreeShipping: freeShipping ? null : toDisplay(FREE_SHIPPING_FROM - subtotal),
      freeShippingProgress: Math.min(1, subtotal / FREE_SHIPPING_FROM),
    }
  })
}
