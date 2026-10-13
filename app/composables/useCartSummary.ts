import type { CartQuoteRequest, CartSummary } from '#shared/types/cart'

// Totals for the cart and checkout pages, priced by the server (POST /api/cart/quote).
// Re-fetches whenever the cart or the discount code changes; the last quote stays on screen while the next one loads.
// /placanje passes the applied code; the answer says whether it works (coupon / couponError).
export function useCartSummary(couponCode?: Ref<string>) {
  const { items } = useCart()

  const body = computed<CartQuoteRequest>(() => ({
    items: items.value.map(({ productId, quantity }) => ({ productId, quantity })),
    couponCode: couponCode?.value || undefined,
  }))

  const { data } = useFetch('/api/cart/quote', {
    method: 'POST',
    body,
    watch: [body],
    default: (): CartSummary => ({
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      coupon: null,
      couponError: null,
      shipping: null,
      total: 0,
      remainingForFreeShipping: null,
      freeShippingProgress: 0,
    }),
  })

  return data
}
