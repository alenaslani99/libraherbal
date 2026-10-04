// A failed $fetch → what the forms show: per-field messages (400/409 from readValidatedForm/formError)
// and one general message (e.g. 401 "Pogrešan email ili lozinka.").
export function apiError(error: unknown): { fields: Record<string, string>, message: string } {
  const body = (error as { data?: { message?: string, data?: { errors?: Record<string, string> } } })?.data
  const fields = body?.data?.errors ?? {}
  const message = Object.keys(fields).length
    ? ''
    : body?.message ?? 'Došlo je do greške. Pokušajte ponovo.'
  return { fields, message }
}

// Only same-site paths, so ?redirect= can't send anyone to another domain
export function safeRedirect(value: unknown, fallback = '/') {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
    ? value
    : fallback
}
