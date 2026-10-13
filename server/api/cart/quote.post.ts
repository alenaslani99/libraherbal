import { z } from 'zod'
import type { CartSummary } from '#shared/types/cart'

const bodySchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
  })).max(100),
  couponCode: z.string().trim().max(40).optional(),
})

// POST /api/cart/quote — prices the cart from the DB, so the browser never decides what the customer pays.
// Products that are gone (deleted or inactive) don't count. A rejected coupon doesn't fail the quote:
// the totals come back without a discount and couponError says why.
export default defineEventHandler(async (event): Promise<CartSummary> => {
  const { items, couponCode } = await readValidatedBody(event, bodySchema.parse)
  const db = useDb(event)

  const ids = [...new Set(items.map(i => i.productId))]
  const prices = new Map<number, number>()
  if (ids.length) {
    const { results } = await db.prepare(`
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

  const found = couponCode ? await findCoupon(db, couponCode) : null
  const coupon = found && 'coupon' in found ? found.coupon : null
  const { discount, shipping, total } = priceCart(subtotal, coupon?.percent)
  const discounted = subtotal - discount
  const freeShipping = shipping === 0

  return {
    itemCount,
    // amounts are in para (1 RSD = 100), the response is in RSD
    subtotal: subtotal / 100,
    discount: discount / 100,
    coupon: coupon && { code: coupon.code, percent: coupon.percent },
    couponError: found && 'error' in found ? found.error : null,
    shipping: freeShipping ? null : shipping / 100,
    total: total / 100,
    remainingForFreeShipping: freeShipping ? null : (FREE_SHIPPING_FROM - discounted) / 100,
    freeShippingProgress: Math.min(1, discounted / FREE_SHIPPING_FROM),
  }
})
