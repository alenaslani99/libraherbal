import type { z } from 'zod'

// Zod issues → { field: first message }, the shape the forms pass to <FormField :error>.
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? '')
    errors[field] ??= issue.message
  }
  return errors
}
