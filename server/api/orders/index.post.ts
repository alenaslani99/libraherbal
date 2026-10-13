import { orderSchema } from '#shared/schemas/order'
import type { OrderConfirmation } from '#shared/types/order'
import type { Coupon } from '../../utils/coupons'

const UNAVAILABLE = 'Neki proizvodi iz korpe više nisu dostupni. Osvežite korpu i pokušajte ponovo.'

// POST /api/orders — saves a checkout. The browser sends only product ids and quantities;
// names and prices are read from D1 here, so nobody can change what they pay.
// Stock is not checked or reduced yet (products.stock is ignored for now). A discount code is checked
// again here and marked used together with the order.
export default defineEventHandler(async (event): Promise<OrderConfirmation> => {
  const { shipping, items, couponCode } = await readValidatedForm(event, orderSchema)
  const db = useDb(event)

  // the same product twice in the body counts as one line
  const quantities = new Map<number, number>()
  for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)

  const { results: products } = await db.prepare(`
    SELECT id, name, regular_price, final_price FROM v_product_card
    WHERE id IN (SELECT value FROM json_each(?1))
  `).bind(JSON.stringify([...quantities.keys()])).all<{ id: number, name: string, regular_price: number | null, final_price: number | null }>()

  // a product that is gone (deleted, inactive) or has no price can't be ordered
  const priced = products.filter(p => p.final_price !== null && p.regular_price !== null)
  if (priced.length !== quantities.size) throw createError({ statusCode: 409, message: UNAVAILABLE })

  // amounts in para (1 RSD = 100), like the DB
  const lines = priced.map((p) => {
    const quantity = quantities.get(p.id)!
    return { productId: p.id, name: p.name, unitPrice: p.final_price!, regularPrice: p.regular_price!, quantity, lineTotal: p.final_price! * quantity }
  })
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)

  // the code was checked on /placanje, but it may have been used or expired since
  let coupon: Coupon | null = null
  if (couponCode) {
    const found = await findCoupon(db, couponCode)
    if ('error' in found) throw formError(409, { couponCode: found.error })
    coupon = found.coupon
  }
  const { discount, shipping: shippingCost, total } = priceCart(subtotal, coupon?.percent)

  const user = await getSessionUser(event)

  // claimed before the order is saved, so two orders at once can't both use it; given back if saving fails
  if (coupon && !(await claimCoupon(db, coupon.id))) {
    throw formError(409, { couponCode: 'Ovaj kod je već iskorišćen.' })
  }

  try {
    // order + items in one batch (D1 runs it as a transaction); a random number can collide
    // with an existing one (UNIQUE), so try a fresh number a few times
    for (let attempt = 0; attempt < 3; attempt++) {
      const orderNumber = newOrderNumber()
      try {
        await db.batch([
          db.prepare(`
            INSERT INTO orders (order_number, user_id, first_name, last_name, email, phone, city, address, postal_code, note,
                                payment_method, subtotal, discount, coupon_code, shipping_cost, total)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'cod', ?11, ?12, ?13, ?14, ?15)
          `).bind(
            orderNumber, user?.id ?? null,
            shipping.firstName, shipping.lastName, shipping.email, shipping.phone,
            shipping.city, shipping.address, shipping.postalCode, shipping.note || null,
            subtotal, discount, coupon?.code ?? null, shippingCost, total,
          ),
          ...lines.map(line => db.prepare(`
            INSERT INTO order_items (order_id, product_id, product_name, unit_price, regular_price, quantity, line_total)
            VALUES ((SELECT id FROM orders WHERE order_number = ?1), ?2, ?3, ?4, ?5, ?6, ?7)
          `).bind(orderNumber, line.productId, line.name, line.unitPrice, line.regularPrice, line.quantity, line.lineTotal)),
          ...(coupon
            ? [db.prepare('UPDATE coupons SET order_id = (SELECT id FROM orders WHERE order_number = ?1) WHERE id = ?2').bind(orderNumber, coupon.id)]
            : []),
          // the order is placed, so the saved cart is no longer "abandoned"
          ...(user ? [db.prepare('DELETE FROM carts WHERE user_id = ?1').bind(user.id)] : []),
        ])
        return { orderNumber }
      }
      catch (error) {
        if (!String(error).includes('UNIQUE constraint failed: orders.order_number')) throw error
      }
    }
    throw createError({ statusCode: 500, message: 'Porudžbina nije sačuvana. Pokušajte ponovo.' })
  }
  catch (error) {
    if (coupon) await releaseCoupon(db, coupon.id)
    throw error
  }
})
