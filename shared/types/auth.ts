// The signed-in user, as GET /api/auth/me, login and register return it.
export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  role: 'customer' | 'admin'
}
