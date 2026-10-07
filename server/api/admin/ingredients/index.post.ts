import { ingredientSchema } from '#shared/schemas/catalog'

// POST /api/admin/ingredients — { name, description? }. Names are unique regardless of case:
// for a name that exists it answers 200 with that ingredient and `existed: true` (the product form
// just links it, the ingredients page reports it), otherwise 201 with the new one.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { name, description } = await readValidatedForm(event, ingredientSchema)
  const db = useDb(event)

  const existing = await db.prepare('SELECT id, name FROM ingredients WHERE name = ?1').bind(name).first<{ id: number, name: string }>()
  if (existing) return { ...existing, existed: true }

  const created = await db.prepare('INSERT INTO ingredients (name, description) VALUES (?1, ?2) RETURNING id, name')
    .bind(name, description || null).first<{ id: number, name: string }>()
  setResponseStatus(event, 201)
  return { ...created!, existed: false }
})
