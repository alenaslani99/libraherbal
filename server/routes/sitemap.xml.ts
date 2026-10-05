// Explicit import: the auto-imported name resolves to the client version when the app types pull this route in
import { queryCollection } from '@nuxt/content/server'

// /sitemap.xml — every indexable page: home, listings, category pages, all active products from D1
// and published blog posts (Nuxt Content).
// Add new public pages (/o-nama, /kontakt, /blog…) to STATIC_PATHS once they exist.

const STATIC_PATHS = ['/', '/proizvodi', '/med', '/cajevi', '/melemi', '/kontakt', '/o-nama', '/cesta-pitanja', '/blog', '/uslovi-koriscenja', '/politika-privatnosti', '/prati-porudzbinu']

const escapeXml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

export default defineEventHandler(async (event) => {
  const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')

  const { results: products } = await useDb(event).prepare(`
    SELECT slug, updated_at FROM products WHERE is_active = 1 ORDER BY id
  `).all<{ slug: string, updated_at: string }>()

  const posts = await queryCollection(event, 'blog').select('path', 'date', 'draft').order('date', 'DESC').all()

  const urls = [
    ...STATIC_PATHS.map(path => ({ loc: `${siteUrl}${path}`, lastmod: undefined as string | undefined })),
    // D1 stores 'YYYY-MM-DD HH:MM:SS' (UTC); the sitemap wants the date part
    ...products.map(p => ({ loc: `${siteUrl}/proizvodi/${encodeURIComponent(p.slug)}`, lastmod: p.updated_at.slice(0, 10) })),
    ...posts.filter(p => !p.draft).map(p => ({ loc: `${siteUrl}${p.path}`, lastmod: p.date.slice(0, 10) })),
  ]

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`
})
