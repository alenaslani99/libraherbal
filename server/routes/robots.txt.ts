// /robots.txt — only the API is off limits; points crawlers to the sitemap.
// Private and transactional pages (korpa, placanje, nalog, admin…) stay crawlable on purpose: they carry
// a noindex meta tag, and Google can only see it if it may fetch the page. Disallowing them here would
// hide the noindex and let their bare URLs show up in results.
export default defineEventHandler((event) => {
  const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
})
