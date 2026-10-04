import type { AuthUser } from '#shared/types/auth'

// GET /api/auth/me — the signed-in user, or null (not an error: being signed out is a normal state).
export default defineEventHandler(async (event): Promise<AuthUser | null> => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return getSessionUser(event)
})
