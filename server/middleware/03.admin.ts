// /admin/** is an SPA route, so without this the server would send its shell with 200 to anyone.
// Non-admins get a real 404 (Nuxt's error page) instead — the panel doesn't reveal it exists.
export default defineEventHandler(async (event) => {
  if (!/^\/admin(?:[/?]|$)/.test(event.path)) return

  const user = await getSessionUser(event)
  if (user?.role !== 'admin') throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
})
