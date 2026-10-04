import type { CartQuoteRequest, CartSummary } from '#shared/types/cart'

// Totals for the cart and checkout pages, priced by the server (POST /api/cart/quote).
// Re-fetches whenever the cart changes; the last quote stays on screen while the next one loads.
export function useCartSummary() {
  const { items } = useCart()

  const body = computed<CartQuoteRequest>(() => ({
    items: items.value.map(({ productId, quantity }) => ({ productId, quantity })),
  }))

  const { data } = useFetch('/api/cart/quote', {
    method: 'POST',
    body,
    watch: [body],
    default: (): CartSummary => ({
      itemCount: 0,
      subtotal: 0,
      shipping: null,
      total: 0,
      remainingForFreeShipping: null,
      freeShippingProgress: 0,
    }),
  })

  return data
}
