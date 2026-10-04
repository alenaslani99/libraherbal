import { orderSchema } from '#shared/schemas/order'
import type { OrderConfirmation } from '#shared/types/order'

const UNAVAILABLE = 'Neki proizvodi iz korpe više nisu dostupni. Osvežite korpu i pokušajte ponovo.'

// POST /api/orders — saves a checkout. The browser sends only product ids and quantities;
// names and prices are read from D1 here, so nobody can change what they pay.
// Stock is not checked or reduced yet (products.stock is ignored for now).
export default defineEventHandler(async (event): Promise<OrderConfirmation> => {
  const { shipping, items } = await readValidatedForm(event, orderSchema)
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
  const shippingCost = shippingFor(subtotal)

  const user = await getSessionUser(event)

  // order + items in one batch (D1 runs it as a transaction); a random number can collide
  // with an existing one (UNIQUE), so try a fresh number a few times
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = newOrderNumber()
    try {
      await db.batch([
        db.prepare(`
          INSERT INTO orders (order_number, user_id, first_name, last_name, email, phone, city, address, postal_code, note,
                              payment_method, subtotal, shipping_cost, total)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'cod', ?11, ?12, ?13)
        `).bind(
          orderNumber, user?.id ?? null,
          shipping.firstName, shipping.lastName, shipping.email, shipping.phone,
          shipping.city, shipping.address, shipping.postalCode, shipping.note || null,
          subtotal, shippingCost, subtotal + shippingCost,
        ),
        ...lines.map(line => db.prepare(`
          INSERT INTO order_items (order_id, product_id, product_name, unit_price, regular_price, quantity, line_total)
          VALUES ((SELECT id FROM orders WHERE order_number = ?1), ?2, ?3, ?4, ?5, ?6, ?7)
        `).bind(orderNumber, line.productId, line.name, line.unitPrice, line.regularPrice, line.quantity, line.lineTotal)),
      ])
      return { orderNumber }
    }
    catch (error) {
      if (!String(error).includes('UNIQUE constraint failed: orders.order_number')) throw error
    }
  }
  throw createError({ statusCode: 500, message: 'Porudžbina nije sačuvana. Pokušajte ponovo.' })
})
