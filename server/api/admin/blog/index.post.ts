import { blogPostSchema } from '#shared/schemas/blog'

// POST /api/admin/blog — create a post; answers with its id (the editor then switches to /admin/blog/:id)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await readValidatedForm(event, blogPostSchema)
  const id = await saveBlogPost(event, data)
  setResponseStatus(event, 201)
  return { id }
})
