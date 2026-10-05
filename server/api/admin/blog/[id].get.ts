import type { AdminBlogPost } from '#shared/types/blog'

// GET /api/admin/blog/:id — a post for the edit form, drafts included
export default defineEventHandler(async (event): Promise<AdminBlogPost> => {
  await requireAdmin(event)
  const id = routeId(event)
  const db = useDb(event)

  const [postRows, productRows] = await db.batch([
    db.prepare('SELECT * FROM blog_posts WHERE id = ?1').bind(id),
    db.prepare('SELECT product_id FROM blog_post_products WHERE post_id = ?1 ORDER BY sort_order').bind(id),
  ])
  const post = postRows!.results[0] as BlogPostRow | undefined
  if (!post) throw createError({ statusCode: 404, message: 'Objava nije pronađena.' })

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    body: post.body,
    image: post.image,
    imageAlt: post.image_alt,
    tags: parseTags(post.tags),
    author: post.author,
    featured: post.featured === 1,
    status: post.status,
    publishedAt: post.published_at ?? '',
    productIds: (productRows!.results as { product_id: number }[]).map(r => r.product_id),
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  }
})
