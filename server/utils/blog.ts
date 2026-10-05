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
function parseTags(value: string): string[] {
  try {
    const tags: unknown = JSON.parse(value)
    return Array.isArray(tags) ? tags.filter((t): t is string => typeof t === 'string') : []
  }
  catch {
    return []
  }
}
