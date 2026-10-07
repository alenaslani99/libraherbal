// Admin search box → a LIKE pattern for "contains" ('' = no search). \ % and _ are taken literally,
// so the SQL needs ESCAPE '\'.
export function likePattern(q: string) {
  return q ? `%${q.replace(/[\\%_]/g, '\\$&')}%` : ''
}

// ?page= from the query string, clamped to 1…10000
export function pageParam(value: unknown) {
  return Math.max(1, Math.min(10_000, Number.parseInt(String(value ?? 1), 10) || 1))
}
