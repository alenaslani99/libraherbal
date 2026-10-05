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
