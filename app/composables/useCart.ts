import type { CartItem } from '#shared/types/cart'

export const CART_MAX_QUANTITY = 99

// Guest cart kept in the browser (localStorage, see plugins/cart.client.ts).
// When accounts are wired, logged-in users can sync this list to the backend.
// add / setQuantity / remove send add_to_cart / remove_from_cart with the quantity that actually changed,
// so every place that changes the cart is tracked (product page, product cards, the stepper on /korpa).
export function useCart() {
  const items = useState<CartItem[]>('cart', () => [])

  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  function track(item: CartItem, change: number) {
    if (!change) return
    trackEcommerce(change > 0 ? 'add_to_cart' : 'remove_from_cart', { items: [analyticsItem(item, Math.abs(change))] })
  }

  function add(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    const existing = items.value.find(i => i.productId === item.productId)
    if (existing) {
      const before = existing.quantity
      existing.quantity = Math.min(CART_MAX_QUANTITY, existing.quantity + quantity)
      track(existing, existing.quantity - before)
    }
    else {
      const added = { ...item, quantity: Math.min(CART_MAX_QUANTITY, quantity) }
      items.value.push(added)
      track(added, added.quantity)
    }
  }

  function setQuantity(productId: number, quantity: number) {
    const item = items.value.find(i => i.productId === productId)
    if (!item) return
    const before = item.quantity
    item.quantity = Math.min(CART_MAX_QUANTITY, Math.max(1, quantity))
    track(item, item.quantity - before)
  }

  function remove(productId: number) {
    const item = items.value.find(i => i.productId === productId)
    items.value = items.value.filter(i => i.productId !== productId)
    if (item) track(item, -item.quantity)
  }

  function clear() {
    items.value = []
  }

  return { items, count, add, setQuantity, remove, clear }
}
