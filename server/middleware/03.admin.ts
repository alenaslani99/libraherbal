// /admin/** is an SPA route, so without this the server would send its shell with 200 to anyone.
// Non-admins get the same static 404 as any unknown path — the panel doesn't reveal it exists.
export default defineEventHandler(async (event) => {
  if (!/^\/admin(?:[/?]|$)/.test(event.path)) return

  const user = await getSessionUser(event)
  if (user?.role !== 'admin') return sendNotFoundPage(event)
})
