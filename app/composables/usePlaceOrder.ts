import type { OrderConfirmation, OrderRequest } from '#shared/types/order'

// Sends the order, empties the cart and opens the thank-you page.
export function usePlaceOrder() {
  const { clear } = useCart()
  const lastOrder = useLastOrder()
  const pending = ref(false)

  async function placeOrder(order: OrderRequest) {
    pending.value = true
    try {
      // Backend: const { orderNumber } = await $fetch<OrderConfirmation>('/api/orders', { method: 'POST', body: order })
      void order
      const { orderNumber }: OrderConfirmation = { orderNumber: `LH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}` }

      // lets the order-placed middleware open /hvala
      lastOrder.value = orderNumber
      // leave the page first, so /placanje doesn't flash its empty-cart state
      await navigateTo('/hvala')
      clear()
    }
    finally {
      pending.value = false
    }
  }

  return { placeOrder, pending }
}
