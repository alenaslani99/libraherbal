import { defineNuxtModule } from '@nuxt/kit'
import type { NuxtPage } from 'nuxt/schema'

// Every route in app/pages as a regex source, for the server (virtual module #page-routes).
// server/middleware/00.not-found.ts uses it to answer unknown paths with a static 404
// before Nuxt renders anything (bots probing /wp-admin, *.php, .env…). Types: shared/types/page-routes.d.ts
export default defineNuxtModule({
  meta: { name: 'page-routes' },
  setup(_, nuxt) {
    let patterns: string[] = []

    nuxt.hook('pages:resolved', (pages) => {
      patterns = [...new Set(flatten(pages).map(toPattern))]
    })

    // A function: read when the server is bundled, after the pages are resolved
    nuxt.hook('nitro:config', (config) => {
      config.virtual ||= {}
      config.virtual['#page-routes'] = () => `export default ${JSON.stringify(patterns)}`
    })
  },
})

// Nested pages (nalog.vue + nalog/*.vue): children's paths are relative to the parent's
function flatten(pages: NuxtPage[], parent = ''): string[] {
  return pages.flatMap((page) => {
    const path = page.path.startsWith('/') ? page.path : `${parent.replace(/\/$/, '')}/${page.path}`
    return [path, ...flatten(page.children ?? [], path)]
  })
}

// '/proizvodi/:slug()' → '/proizvodi/[^/]+'; optional ':x?' and catch-all ':x(.*)*' allow nothing too
function toPattern(path: string): string {
  const segments = path.split('/').filter(Boolean).map((segment) => {
    if (/^:\w+\(\.\*\)\*$/.test(segment)) return '(?:/.*)?'
    if (/^:\w+(?:\(\))?\?$/.test(segment)) return '(?:/[^/]+)?'
    const parts = segment.split(/(:\w+(?:\([^)]*\))?)/).map(part =>
      part.startsWith(':') ? '[^/]+' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    return `/${parts.join('')}`
  })
  return segments.join('') || '/'
}
