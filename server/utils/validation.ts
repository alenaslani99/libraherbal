import type { H3Event } from 'h3'
import type { z } from 'zod'

// Like readValidatedBody, but a 400 carries { errors: { field: message } } —
// the same shape the forms build with fieldErrors(), so server errors land under the right field.
export async function readValidatedForm<T extends z.ZodType>(event: H3Event, schema: T): Promise<z.output<T>> {
  const result = schema.safeParse(await readBody(event))
  if (!result.success) throw formError(400, fieldErrors(result.error))
  return result.data
}

export function formError(statusCode: number, errors: Record<string, string>) {
  return createError({ statusCode, message: Object.values(errors)[0], data: { errors } })
}
