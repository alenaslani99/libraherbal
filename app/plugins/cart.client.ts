import type { CartItem } from '#shared/types/cart'

const STORAGE_KEY = 'libraherbal:cart'

// Restores the guest cart from localStorage and saves every change back.
// Client-only: SSR pages render without the cart (the header badge is <ClientOnly>), so no hydration mismatch.
export default defineNuxtPlugin(() => {
  const { items } = useCart()

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (Array.isArray(saved)) items.value = saved as CartItem[]  }
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
})
