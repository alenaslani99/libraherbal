import { adminOrderUpdateSchema } from '#shared/schemas/order'
import type { AdminOrder, OrderStatus } from '#shared/types/order'

// PATCH /api/admin/orders/:id — { status?, adminNote? }; answers with the updated order.
// A new status gets today's date in its <status>_at column, which /prati-porudzbinu shows.
// Going back in the flow (U transportu → U pripremi) clears the dates of the later steps, and
// leaving 'cancelled' clears cancelled_at; cancelling keeps the dates of what already happened.
export default defineEventHandler(async (event): Promise<AdminOrder> => {
  await requireAdmin(event)
  const id = routeId(event)
  const { status, adminNote } = await readValidatedForm(event, adminOrderUpdateSchema)
  const db = useDb(event)

  const current = await db.prepare('SELECT status FROM orders WHERE id = ?1').bind(id).first<{ status: OrderStatus }>()
  if (!current) throw createError({ statusCode: 404, message: 'Porudžbina nije pronađena.' })

  // column names come from the fixed status list, never from the request as-is
  const sets = [`updated_at = datetime('now')`]
  const values: (string | number | null)[] = []

  if (status && status !== current.status) {
    values.push(status)
    sets.push(`status = ?${values.length}`, `${status}_at = datetime('now')`)
    if (status !== 'cancelled') {
      sets.push('cancelled_at = NULL')
      for (const later of ORDER_FLOW.slice(ORDER_FLOW.indexOf(status) + 1)) sets.push(`${later}_at = NULL`)
    }
  }
  if (adminNote !== undefined) {
    values.push(adminNote || null)
    sets.push(`admin_note = ?${values.length}`)
  }

  values.push(id)
  await db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?${values.length}`).bind(...values).run()

  return loadAdminOrder(event, id)
})
