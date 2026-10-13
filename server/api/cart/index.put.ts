import { z } from 'zod'

const bodySchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1).max(99),
  })).max(100),
})

// PUT /api/cart — saves the signed-in user's cart (only ids + quantities; prices always come from products).
// Compared with what is saved first, so only changed lines are written and an unchanged cart costs no write:
// D1 bills per row written, and updated_at must mean "last real change" for the abandoned-cart reminder.
// An empty cart deletes the cart (its items go with it, ON DELETE CASCADE).
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const { items } = await readValidatedBody(event, bodySchema.parse)
  const db = useDb(event)
  setResponseStatus(event, 204)

  // the same product twice counts as one line
  const wanted = new Map<number, number>()
  for (const item of items) wanted.set(item.productId, Math.min(99, (wanted.get(item.productId) ?? 0) + item.quantity))

  if (!wanted.size) {
    await db.prepare('DELETE FROM carts WHERE user_id = ?1').bind(user.id).run()
    return
  }

  const { results: saved } = await db.prepare(`
    SELECT i.product_id, i.quantity FROM carts c JOIN cart_items i ON i.cart_id = c.id WHERE c.user_id = ?1
  `).bind(user.id).all<{ product_id: number, quantity: number }>()
  const current = new Map(saved.map(row => [row.product_id, row.quantity]))

  const removed = [...current.keys()].filter(id => !wanted.has(id))
  const changed = [...wanted].filter(([id, quantity]) => current.get(id) !== quantity)
  if (!removed.length && !changed.length) return

  // only products that still exist, or the foreign key would fail the whole batch
  const placeholders = changed.map((_, i) => `?${i + 1}`).join(', ')
  const { results: existing } = changed.length
    ? await db.prepare(`SELECT id FROM products WHERE id IN (${placeholders})`).bind(...changed.map(([id]) => id)).all<{ id: number }>()
    : { results: [] }
  const existingIds = new Set(existing.map(row => row.id))

  const cartId = '(SELECT id FROM carts WHERE user_id = ?1)'
  await db.batch([
    db.prepare(`
      INSERT INTO carts (user_id) VALUES (?1)
      ON CONFLICT (user_id) DO UPDATE SET updated_at = datetime('now')
    `).bind(user.id),
    ...removed.map(productId => db.prepare(`DELETE FROM cart_items WHERE cart_id = ${cartId} AND product_id = ?2`).bind(user.id, productId)),
    ...changed.filter(([id]) => existingIds.has(id)).map(([productId, quantity]) => db.prepare(`
      INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (${cartId}, ?2, ?3)
      ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = excluded.quantity, updated_at = datetime('now')
    `).bind(user.id, productId, quantity)),
  ])
})
