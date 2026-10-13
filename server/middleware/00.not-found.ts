// Page requests for paths that aren't in app/pages (bots probing /wp-admin, *.php, .env…) get a
// static 404 right here. Rendering Nuxt's error page for each of them costs a full SSR render,
// which runs over the Workers CPU limit. Wrong slugs on real routes (/proizvodi/nepostoji)
// still go through Nuxt, which shows app/error.vue.
// Off in dev: the route list is only built with the server bundle, so new pages would 404 until a restart.
export default defineEventHandler((event) => {
  if (import.meta.dev || (event.method !== 'GET' && event.method !== 'HEAD')) return

  const path = event.path.split('?')[0]!
  // /api, /_nuxt, /__nuxt_error, /_ipx… and the server routes have their own handlers
  if (path.startsWith('/api/') || path.startsWith('/_') || path === '/robots.txt' || path === '/sitemap.xml') return

  if (!isPageRoute(path)) return sendNotFoundPage(event)
})
