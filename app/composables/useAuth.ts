import type { AuthUser } from '#shared/types/auth'
import type { LoginInput, RegisterInput } from '#shared/schemas/auth'

// The signed-in user (null = guest). Filled once per visit by plugins/auth.ts;
// login/register/logout keep it in sync, the session itself lives in an HttpOnly cookie.
export function useAuth() {
  const user = useState<AuthUser | null>('auth:user', () => null)
  const loggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function fetchUser() {
    // signed out answers 204 (no body)
    user.value = (await $fetch<AuthUser | null>('/api/auth/me').catch(() => null)) ?? null
  }

  async function login(body: LoginInput) {
    user.value = await $fetch<AuthUser>('/api/auth/login', { method: 'POST', body })
  }

  async function register(body: RegisterInput) {
    user.value = await $fetch<AuthUser>('/api/auth/register', { method: 'POST', body })
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/')
  }

  return { user, loggedIn, isAdmin, fetchUser, login, register, logout }
}
