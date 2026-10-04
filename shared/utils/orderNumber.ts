// Order numbers look like LH-2026-48213907: year + 8 random digits, so they can't be guessed in sequence
export const ORDER_NUMBER_PATTERN = /^LH-\d{4}-\d{8}$/

// What people type ("#lh-2026-48213907 ") → "LH-2026-48213907"
export function normalizeOrderNumber(value: string) {
  return value.trim().replace(/^#/, '').toUpperCase()
}
