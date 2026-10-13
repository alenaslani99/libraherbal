import type { CartItem } from '#shared/types/cart'

// v2: items are keyed by productId (v1 carts held variant ids and are dropped)
const STORAGE_KEY = 'libraherbal:cart:v2'
// wait for the clicks to stop before saving, so pressing + five times is one request
const SAVE_DELAY = 2000

// What the server stores, as a comparable string: only ids + quantities, prices always come from products
function signature(list: CartItem[]) {
  return list.map(item => `${item.productId}:${item.quantity}`).join(',')
}

function payload(list: CartItem[]) {
  return { items: list.map(item => ({ productId: item.productId, quantity: item.quantity })) }
}

// Restores the cart from localStorage and saves every change back.
// Client-only: SSR pages render without the cart (the header badge is <ClientOnly>), so no hydration mismatch.
// Signed in, the cart is also kept in D1 (needed for the abandoned-cart email):
//  - page load: the saved cart wins, so a change made on another device shows up here
//  - login / registration: the guest cart is merged into the saved one (higher quantity wins)
//  - logout: the cart is emptied on this device; it stays saved on the account
// Runs after plugins/auth.ts (alphabetical order), so the user is already known.
export default defineNuxtPlugin(() => {
  const { items } = useCart()
  const { user } = useAuth()

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (Array.isArray(saved)) items.value = saved as CartItem[]
  }
  catch {
    // blocked or corrupted storage — start with an empty cart
  }

  watch(items, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    }
    catch {
      // storage full or blocked — the cart still works for this visit
    }
  }, { deep: true })

  // what the server has; a change that matches it isn't sent again
  let synced = ''
  let timer: ReturnType<typeof setTimeout> | undefined

  async function load() {
    return await $fetch<CartItem[]>('/api/cart').catch(() => null)
  }

  async function save() {
    timer = undefined
    if (!user.value) return
    const list = items.value
    try {
      await $fetch('/api/cart', { method: 'PUT', body: payload(list) })
      synced = signature(list)
    }
    catch {
      // offline or session gone — the next change tries again
    }
  }

  function replace(list: CartItem[]) {
    synced = signature(list)
    items.value = list
  }

  // not awaited: the page shows the local cart meanwhile instead of waiting for the request
  if (user.value) {
    load().then((server) => {
      if (server) replace(server)
    })
  }

  watch(() => user.value?.id, async (id, previous) => {
    clearTimeout(timer)
    timer = undefined

    if (!id) {
      synced = ''
      items.value = []
      return
    }
    if (previous) return

    // signed in just now: guest cart + saved cart
    const server = await load()
    if (!server) return
    const merged = [...server]
    for (const item of items.value) {
      const existing = merged.find(i => i.productId === item.productId)
      if (!existing) merged.push(item)
      else existing.quantity = Math.max(existing.quantity, item.quantity)
    }
    synced = signature(server)
    items.value = merged
  })

  watch(items, (value) => {
    if (!user.value || signature(value) === synced) return
    clearTimeout(timer)
    timer = setTimeout(save, SAVE_DELAY)
  }, { deep: true })

  // leaving the page before the delay is over: send it now, keepalive lets it finish after the page is gone
  window.addEventListener('pagehide', () => {
    if (!timer || !user.value) return
    clearTimeout(timer)
    timer = undefined
    fetch('/api/cart', {
      method: 'PUT',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload(items.value)),
    }).catch(() => {})
  })
})
