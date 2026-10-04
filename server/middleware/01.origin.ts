// CSRF: on top of SameSite=Lax, refuse state-changing API calls sent from another site.
// Browsers always send Origin on POST/PUT/PATCH/DELETE; no Origin = not a browser (SSR, curl), allowed.
export default defineEventHandler((event) => {
  if (event.method === 'GET' || event.method === 'HEAD' || !event.path.startsWith('/api/')) return

  const origin = getRequestHeader(event, 'origin')
  if (origin && hostOf(origin) !== getRequestHost(event)) {
    throw createError({ statusCode: 403, message: 'Zahtev nije dozvoljen.' })
  }
})

function hostOf(url: string) {
  try {
    return new URL(url).host
  }
  catch {
    return null
  }
}
