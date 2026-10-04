import type { RateLimit } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'

// Cloudflare's Rate Limiting binding (declared in wrangler.jsonc "ratelimits").
// Counts are per Cloudflare location and approximate: good against abuse and brute force, not exact quotas.
export type RateLimiter = 'RL_AUTH' | 'RL_LOGIN_EMAIL' | 'RL_WRITE' | 'RL_READ'

const TOO_MANY = 'Previše zahteva. Pokušajte ponovo za minut.'

// Throws 429 once `key` is over the limiter's budget.
// A missing binding is a deploy mistake: it's logged, and the request goes through so the shop keeps working.
export async function rateLimit(event: H3Event, limiter: RateLimiter, key: string) {
  const binding = event.context.cloudflare?.env?.[limiter] as RateLimit | undefined
  if (!binding) {
    console.error(`[rate-limit] binding ${limiter} is missing`)
    return
  }

  const { success } = await binding.limit({ key })
  if (!success) {
    setResponseHeader(event, 'Retry-After', 60)
    throw createError({ statusCode: 429, message: TOO_MANY })
  }
}

// The visitor's IP as Cloudflare sees it (not spoofable via X-Forwarded-For)
export function clientIp(event: H3Event) {
  return getRequestHeader(event, 'cf-connecting-ip') ?? getRequestIP(event) ?? 'unknown'
}
