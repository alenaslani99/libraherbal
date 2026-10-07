// Runs a D1 write; a UNIQUE violation becomes a 409 form error under that column's field,
// e.g. "UNIQUE constraint failed: purposes.slug" → { slug: 'Već postoji…' }
const MESSAGES: Record<string, string> = {
  'purposes.name': 'Svrha sa ovim nazivom već postoji.',
  'purposes.slug': 'Svrha sa ovom adresom već postoji.',
  'ingredients.name': 'Sastojak sa ovim nazivom već postoji.',
}

export async function runUnique<T>(write: () => Promise<T>): Promise<T> {
  try {
    return await write()
  }
  catch (error) {
    const match = /UNIQUE constraint failed: (\w+)\.(\w+)/.exec(String((error as Error)?.message))
    if (match) throw formError(409, { [match[2]!]: MESSAGES[`${match[1]}.${match[2]}`] ?? 'Ova vrednost već postoji.' })
    throw error
  }
}
