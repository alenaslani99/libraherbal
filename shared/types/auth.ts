// The signed-in user, as GET /api/auth/me, login and register return it.
export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  role: 'customer' | 'admin'
  // on the newsletter list — the newsletter forms show a one-click button or "already subscribed"
  subscribed: boolean
}

// Set by getSessionUser() (server/utils/session.ts); the app reads it during SSR (plugins/auth.ts).
declare module 'h3' {
  interface H3EventContext {
    // undefined = not looked up yet, null = signed out
    user?: AuthUser | null
  }
}
