import { purposeSchema } from '#shared/schemas/catalog'

// POST /api/admin/catalog/purposes — { name, slug }; a new purpose goes to the end of the filter
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { name, slug } = await readValidatedForm(event, purposeSchema)

  const created = await runUnique(() => useDb(event).prepare(`
    INSERT INTO purposes (name, slug, sort_order)
    VALUES (?1, ?2, COALESCE((SELECT MAX(sort_order) FROM purposes), 0) + 1)
    RETURNING id
  `).bind(name, slug).first<{ id: number }>())

  setResponseStatus(event, 201)
  return { id: created!.id }
})
