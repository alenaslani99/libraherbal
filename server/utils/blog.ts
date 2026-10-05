import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'
import type { BlogPostData } from '#shared/schemas/blog'
import type { BlogPostCard } from '#shared/types/blog'

// A row of blog_posts (see migrations/0006_blog.sql)
export interface BlogPostRow {
  id: number
  slug: string
  title: string
  description: string
  body: string
  image: string
  image_alt: string
  tags: string
  author: string
  featured: number
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export const BLOG_CARD_COLUMNS = 'slug, title, description, image, image_alt, tags, featured, published_at'

export function toBlogCard(row: Pick<BlogPostRow, 'slug' | 'title' | 'description' | 'image' | 'image_alt' | 'tags' | 'featured' | 'published_at'>): BlogPostCard {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    image: row.image,
    imageAlt: row.image_alt,
    tags: parseTags(row.tags),
    date: row.published_at ?? '',
    featured: row.featured === 1,
  }
}

// tags are a JSON array in one column; a broken value shows no tags instead of a 500
export function parseTags(value: string): string[] {
  try {
    const tags: unknown = JSON.parse(value)
    return Array.isArray(tags) ? tags.filter((t): t is string => typeof t === 'string') : []
  }
  catch {
    return []
  }
}

// Today in Serbia as 'YYYY-MM-DD' (the Worker runs in UTC)
function todayInBelgrade() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Belgrade' })
}

// Create (no id) or update a post from the validated admin form; returns the post id.
// Post, featured flag and product links are written in one D1 batch, so a failed save changes nothing.
export async function saveBlogPost(event: H3Event, data: BlogPostData, id?: number): Promise<number> {
  const db = useDb(event)

  // publishing without a date: keep the date it was first published with, otherwise today
  let publishedAt: string | null = data.publishedAt || null
  if (!publishedAt && data.status === 'published') {
    const current = id
      ? await db.prepare('SELECT published_at FROM blog_posts WHERE id = ?1').bind(id).first<{ published_at: string | null }>()
      : null
    publishedAt = current?.published_at ?? todayInBelgrade()
  }

  const values = [
    data.slug, data.title, data.description, data.body, data.image, data.imageAlt,
    JSON.stringify(data.tags), data.author, data.featured ? 1 : 0, data.status, publishedAt,
  ]

  try {
    if (id === undefined) {
      const row = await db.prepare(`
        INSERT INTO blog_posts (slug, title, description, body, image, image_alt, tags, author, featured, status, published_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
        RETURNING id
      `).bind(...values).first<{ id: number }>()
      id = row!.id
      await db.batch(relatedStatements(db, id, data))
    }
    else {
      const [update] = await db.batch([
        db.prepare(`
          UPDATE blog_posts SET slug = ?1, title = ?2, description = ?3, body = ?4, image = ?5, image_alt = ?6,
            tags = ?7, author = ?8, featured = ?9, status = ?10, published_at = ?11, updated_at = datetime('now')
          WHERE id = ?12
        `).bind(...values, id),
        ...relatedStatements(db, id, data),
      ])
      if (!update!.meta.changes) throw createError({ statusCode: 404, message: 'Objava nije pronađena.' })
    }
  }
  catch (error) {
    if (String((error as Error)?.message).includes('UNIQUE constraint failed: blog_posts.slug')) {
      throw formError(409, { slug: 'Objava sa ovom adresom već postoji.' })
    }
    throw error
  }

  return id
}

// Only one featured post at a time; product links are replaced as a whole (unknown ids are skipped)
function relatedStatements(db: D1Database, id: number, data: BlogPostData) {
  return [
    ...(data.featured ? [db.prepare('UPDATE blog_posts SET featured = 0 WHERE featured = 1 AND id <> ?1').bind(id)] : []),
    db.prepare('DELETE FROM blog_post_products WHERE post_id = ?1').bind(id),
    ...data.productIds.map((productId, i) => db.prepare(`
      INSERT INTO blog_post_products (post_id, product_id, sort_order)
      SELECT ?1, id, ?3 FROM products WHERE id = ?2
    `).bind(id, productId, i + 1)),
  ]
}
