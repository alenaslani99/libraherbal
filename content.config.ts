import { defineCollection, defineContentConfig } from '@nuxt/content'

// Blog collection and page schemas are added in the content step
export default defineContentConfig({
  collections: {
    pages: defineCollection({
      type: 'page',
      source: '**/*.md',
    }),
  },
})
