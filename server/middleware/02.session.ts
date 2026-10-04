// Page requests: look the session up before SSR, so the app reads the user from the request
// (no internal /api/auth/me fetch) and a sliding refresh's Set-Cookie reaches the browser.
// API routes look it up themselves, only when they need it (requireUser / getSessionUser).
export default defineEventHandler(async (event) => {
  if (event.method !== 'GET' || event.path.startsWith('/api/') || event.path.startsWith('/_')) return
  await getSessionUser(event)
})
