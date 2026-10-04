// Who is signed in, resolved before the first page renders (route middleware depends on it).
// SSR: read from the request — server/middleware/02.session.ts already looked the session up.
// Browser: only pages that weren't rendered for this request (SPA routes like /admin, /nalog,
// prerendered pages) ask /api/auth/me; SSR pages hand the user over in the payload.
// If HTML ever gets cached (SWR route rules), those pages must ask /api/auth/me too.
export default defineNuxtPlugin(async (nuxtApp) => {
  const { user, fetchUser } = useAuth()

  if (import.meta.server) {
    user.value = useRequestEvent()?.context.user ?? null
    return
  }

  if (!nuxtApp.payload.serverRendered || nuxtApp.payload.prerenderedAt) await fetchUser()
})
