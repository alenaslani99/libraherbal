import { contactMessageUpdateSchema } from '#shared/schemas/contact'

// PATCH /api/admin/messages/:id — { status: 'new' | 'read' | 'answered' }
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const { status } = await readValidatedForm(event, contactMessageUpdateSchema)

  const { meta } = await useDb(event).prepare(`
    UPDATE contact_messages SET status = ?1, updated_at = datetime('now') WHERE id = ?2
  `).bind(status, id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Poruka nije pronađena.' })

  return { id, status }
})
