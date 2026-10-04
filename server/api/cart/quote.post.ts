import { z } from 'zod'
import type { CartSummary } from '#shared/types/cart'

const bodySchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
  })).max(100),
})

// POST /api/cart/quote — prices the cart from the DB, so the browser never decides what the customer pays.
// Products that are gone (deleted or inactive) don't count.
export default defineEventHandler(async (event): Promise<CartSummary> => {
  const { items } = await readValidatedBody(event, bodySchema.parse)

  const ids = [...new Set(items.map(i => i.productId))]
  const prices = new Map<number, number>()
  if (ids.length) {
    const { results } = await useDb(event).prepare(`
      SELECT id, final_price FROM v_product_card
      WHERE id IN (SELECT value FROM json_each(?1))
    `).bind(JSON.stringify(ids)).all<{ id: number, final_price: number | null }>()
    for (const row of results) prices.set(row.id, row.final_price ?? 0)
  }

  let itemCount = 0
  let subtotal = 0
  for (const item of items) {
    const price = prices.get(item.productId)
    if (price === undefined) continue
    itemCount += item.quantity
    subtotal += price * item.quantity
  }

  const shipping = shippingFor(subtotal)
  const freeShipping = shipping === 0

  return {
    itemCount,
    // amounts are in para (1 RSD = 100), the response is in RSD
    subtotal: subtotal / 100,
    shipping: freeShipping ? null : shipping / 100,
    total: (subtotal + shipping) / 100,
    remainingForFreeShipping: freeShipping ? null : (FREE_SHIPPING_FROM - subtotal) / 100,
    freeShippingProgress: Math.min(1, subtotal / FREE_SHIPPING_FROM),
  }
})
