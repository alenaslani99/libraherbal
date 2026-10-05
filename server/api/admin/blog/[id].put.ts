import { blogPostSchema } from '#shared/schemas/blog'

// PUT /api/admin/blog/:id — save the whole form
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = routeId(event)
  const data = await readValidatedForm(event, blogPostSchema)
  await saveBlogPost(event, data, id)
  return { id }
})
