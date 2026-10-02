import type { OrderConfirmation, OrderRequest } from '#shared/types/order'

// Sends the order, empties the cart and opens the thank-you page.
export function usePlaceOrder() {
  const { clear } = useCart()
  const pending = ref(false)

  async function placeOrder(order: OrderRequest) {
    pending.value = true
    try {
      // Backend: const { orderNumber } = await $fetch<OrderConfirmation>('/api/orders', { method: 'POST', body: order })
      void order
      const { orderNumber }: OrderConfirmation = { orderNumber: `LH-${Math.floor(1000 + Math.random() * 9000)}` }

      // leave the page first, so /placanje doesn't flash its empty-cart state
      await navigateTo({ path: '/hvala', query: { broj: orderNumber } })
      clear()
    }
    finally {
      pending.value = false
    }
  }

  return { placeOrder, pending }
}
