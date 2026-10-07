import { adminIngredientSchema } from '#shared/schemas/product'

// POST /api/admin/ingredients — { name }; adds an ingredient from the product form.
// Names are unique regardless of case, so an existing one is returned instead of a duplicate.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { name } = await readValidatedForm(event, adminIngredientSchema)
  const db = useDb(event)

  const existing = await db.prepare('SELECT id, name FROM ingredients WHERE name = ?1').bind(name).first<{ id: number, name: string }>()
  if (existing) return existing

  const created = await db.prepare('INSERT INTO ingredients (name) VALUES (?1) RETURNING id, name').bind(name).first<{ id: number, name: string }>()
  setResponseStatus(event, 201)
  return created!
})
