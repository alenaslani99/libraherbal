import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// Blog posts: content/blog/<slug>.md → /blog/<slug>. Writing guide: content/blog/README.md
export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: { include: 'blog/*.md', exclude: ['blog/README.md'] },
      schema: z.object({
        // excerpt: hero subtitle, card text and the Google description (~150 characters)
        description: z.string(),
        date: z.date(),
        author: z.string().default('Libra Herbal tim'),
        tags: z.array(z.string()).default([]),
        // cover photo (public/blog/…), also the social preview image
        image: z.string(),
        imageAlt: z.string().default(''),
        // the big card at the top of /blog; without one, the newest post is featured
        featured: z.boolean().default(false),
        // "Preporučeni proizvodi" in the sidebar: product slugs from the shop
        products: z.array(z.string()).default([]),
        // true: hidden everywhere (404), handy while a post is unfinished
        draft: z.boolean().default(false),
      }),
    }),
  },
})
