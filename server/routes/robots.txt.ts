// /robots.txt — private and transactional pages stay out of search; points crawlers to the sitemap
export default defineEventHandler((event) => {
  const siteUrl = useRuntimeConfig(event).public.siteUrl.replace(/\/$/, '')

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /korpa',
    'Disallow: /placanje',
    'Disallow: /hvala',
    'Disallow: /prijava',
    'Disallow: /registracija',
    'Disallow: /nalog/',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
})
