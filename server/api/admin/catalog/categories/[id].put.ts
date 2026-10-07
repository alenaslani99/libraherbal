import { categoryNameSchema } from '#shared/schemas/catalog'

// PUT /api/admin/catalog/categories/:id — { name }. The slug stays: /med, /cajevi and /melemi
// are pages in the code (app/data/categories.ts) that find their products by it.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const { name } = await readValidatedForm(event, categoryNameSchema)

  const { meta } = await useDb(event).prepare(`
    UPDATE categories SET name = ?1, updated_at = datetime('now') WHERE id = ?2
  `).bind(name, id).run()
  if (!meta.changes) throw createError({ statusCode: 404, message: 'Kategorija nije pronađena.' })

  return { id, name }
})
