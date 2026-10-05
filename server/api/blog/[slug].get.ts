import type { BlogPost } from '#shared/types/blog'

// GET /api/blog/:slug — a published post with its "Preporučeni proizvodi"; drafts are a 404
export default defineEventHandler(async (event): Promise<BlogPost> => {
  const slug = getRouterParam(event, 'slug') ?? ''
  const db = useDb(event)

  const post = await db.prepare(`
    SELECT * FROM blog_posts WHERE slug = ?1 AND status = 'published'
  `).bind(slug).first<BlogPostRow>()

  if (!post) {
    throw createError({ statusCode: 404, message: 'Objava nije pronađena' })
  }

  // inactive products drop out through v_product_card
  const { results: products } = await db.prepare(`
    SELECT v.* FROM blog_post_products bp
    JOIN v_product_card v ON v.id = bp.product_id
    WHERE bp.post_id = ?1
    ORDER BY bp.sort_order
  `).bind(post.id).all<ProductCardRow>()

  return {
    ...toBlogCard(post),
    body: post.body,
    author: post.author,
    products: products.map(toProduct),
  }
})
