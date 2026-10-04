import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'

// The D1 binding declared in wrangler.jsonc (in `nuxt dev` it comes from nitro-cloudflare-dev).
// SSR calls to /api/* go through an internal fetch whose event has no `cloudflare` context,
// so fall back to the env the Cloudflare entry keeps on globalThis.__env__.
export function useDb(event: H3Event): D1Database {
  const env = event.context.cloudflare?.env ?? (globalThis as { __env__?: Record<string, unknown> }).__env__
  const db = env?.DB as D1Database | undefined
  if (!db) throw createError({ statusCode: 500, message: 'D1 binding "DB" is missing' })
  return db
}
