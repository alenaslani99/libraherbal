import type { BlogPostCard } from '#shared/types/blog'

// GET /api/blog — every published post, newest first (the page splits featured / grid / pages)
export default defineEventHandler(async (event): Promise<BlogPostCard[]> => {
  const { results } = await useDb(event).prepare(`
    SELECT ${BLOG_CARD_COLUMNS} FROM blog_posts
    WHERE status = 'published'
    ORDER BY published_at DESC, id DESC
  `).all<BlogPostRow>()

  return results.map(toBlogCard)
})
