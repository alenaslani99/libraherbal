import { ingredientSchema } from '#shared/schemas/catalog'

// PUT /api/admin/ingredients/:id — { name, description }; shown under "Sastojci" on every product that has it
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const { name, description } = await readValidatedForm(event, ingredientSchema)

  const result = await runUnique(() => useDb(event).prepare(`
    UPDATE ingredients SET name = ?1, description = ?2, updated_at = datetime('now') WHERE id = ?3
  `).bind(name, description || null, id).run())
  if (!result.meta.changes) throw createError({ statusCode: 404, message: 'Sastojak nije pronađen.' })

  return { id }
})
