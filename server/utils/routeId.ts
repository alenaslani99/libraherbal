import type { H3Event } from 'h3'

// Numeric :id route param; anything else is a 404 (same answer as an id that doesn't exist)
export function routeId(event: H3Event, name = 'id'): number {
  const id = Number(getRouterParam(event, name))
  if (!Number.isSafeInteger(id) || id < 1) throw createError({ statusCode: 404, message: 'Nije pronađeno.' })
  return id
}
