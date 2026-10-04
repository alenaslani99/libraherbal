import type { RateLimiter } from '../utils/rateLimit'

// Every /api/** call is rate limited per IP, in three tiers (limits in wrangler.jsonc):
//   RL_AUTH   — strict: sign in / sign up / password change (guessing, account spam), contact form (spam),
//               order tracking (guessing order numbers)
//   RL_WRITE  — other POST/PUT/PATCH/DELETE (cart quote, logout, orders)
//   RL_READ   — GET (products, filters, me)
// Login is additionally limited per email (login.post.ts).
const STRICT_ROUTES = new Set(['/api/auth/login', '/api/auth/register', '/api/auth/password', '/api/contact', '/api/orders/track'])

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0]!
  if (!path.startsWith('/api/')) return

  // SSR's own /api calls run inside the page request (no Cloudflare context) — the visitor
  // isn't calling them, and without a real IP they would all share one bucket.
  if (!event.context.cloudflare) return

  const limiter: RateLimiter = STRICT_ROUTES.has(path)
    ? 'RL_AUTH'
    : event.method === 'GET' || event.method === 'HEAD' ? 'RL_READ' : 'RL_WRITE'

  await rateLimit(event, limiter, clientIp(event))
})
