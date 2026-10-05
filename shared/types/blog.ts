import type { Product } from './product'

// A published post as a card on /blog
export interface BlogPostCard {
  slug: string
  title: string
  description: string
  image: string
  imageAlt: string
  tags: string[]
  // 'YYYY-MM-DD'
  date: string
  featured: boolean
}

// /blog/<slug>: body is Markdown, rendered with <MDC>
export interface BlogPost extends BlogPostCard {
  body: string
  author: string
  products: Product[]
}

// /admin/blog table row (drafts included)
export interface AdminBlogListItem {
  id: number
  slug: string
  title: string
  status: 'draft' | 'published'
  featured: boolean
  // 'YYYY-MM-DD' or null for a draft that was never published
  publishedAt: string | null
  updatedAt: string
}

// /admin/blog/:id edit form: the form fields plus bookkeeping
export interface AdminBlogPost {
  id: number
  title: string
  slug: string
  description: string
  body: string
  image: string
  imageAlt: string
  tags: string[]
  author: string
  featured: boolean
  status: 'draft' | 'published'
  publishedAt: string
  productIds: number[]
  createdAt: string
  updatedAt: string
}

// "Preporučeni proizvodi" picker in the admin form
export interface AdminProductOption {
  id: number
  name: string
  weight: string
  isActive: boolean
}
