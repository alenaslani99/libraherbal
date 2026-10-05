import type { AdminBlogListItem } from '#shared/types/blog'

// GET /api/admin/blog — every post, drafts included; drafts first, then newest
export default defineEventHandler(async (event): Promise<AdminBlogListItem[]> => {
  await requireAdmin(event)

  const { results } = await useDb(event).prepare(`
    SELECT id, slug, title, status, featured, published_at, updated_at FROM blog_posts
    ORDER BY status = 'published', COALESCE(published_at, created_at) DESC, id DESC
  `).all<Pick<BlogPostRow, 'id' | 'slug' | 'title' | 'status' | 'featured' | 'published_at' | 'updated_at'>>()

  return results.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    featured: row.featured === 1,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }))
})
