import type { CartItem } from '#shared/types/cart'

export const CART_MAX_QUANTITY = 99

// Guest cart kept in the browser (localStorage, see plugins/cart.client.ts).
// When accounts are wired, logged-in users can sync this list to the backend.
export function useCart() {
  const items = useState<CartItem[]>('cart', () => [])

  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  function add(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    const existing = items.value.find(i => i.variantId === item.variantId)
    if (existing) {
      existing.quantity = Math.min(CART_MAX_QUANTITY, existing.quantity + quantity)
    }
    else {
      items.value.push({ ...item, quantity: Math.min(CART_MAX_QUANTITY, quantity) })
    }
  }

  function setQuantity(variantId: number, quantity: number) {
    const item = items.value.find(i => i.variantId === variantId)
    if (item) item.quantity = Math.min(CART_MAX_QUANTITY, Math.max(1, quantity))
  }

  function remove(variantId: number) {
    items.value = items.value.filter(i => i.variantId !== variantId)
  }

  function clear() {
    items.value = []
  }

  return { items, count, add, setQuantity, remove, clear }
}
