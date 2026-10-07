import { purposeSchema } from '#shared/schemas/catalog'

// PUT /api/admin/catalog/purposes/:id — { name, slug }
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const { name, slug } = await readValidatedForm(event, purposeSchema)

  const result = await runUnique(() => useDb(event).prepare(`
    UPDATE purposes SET name = ?1, slug = ?2, updated_at = datetime('now') WHERE id = ?3
  `).bind(name, slug, id).run())
  if (!result.meta.changes) throw createError({ statusCode: 404, message: 'Svrha nije pronađena.' })

  return { id }
})
