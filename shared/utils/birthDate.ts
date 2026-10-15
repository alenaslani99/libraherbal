// Dates people see and type are day.month.year (15.10.1990); the DB stores YYYY-MM-DD.

// "5.3.1990", "05.03.1990." (or "1990-03-05", how browser autofill may put it) → "1990-03-05",
// or null if it isn't a real date
export function birthDateToIso(value: string) {
  const text = value.trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  const match = iso ? [iso[0], iso[3], iso[2], iso[1]] : /^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})\.?$/.exec(text)
  if (!match) return null
  const [day, month, year] = [Number(match[1]), Number(match[2]), Number(match[3])]
  // Date rolls 31.02. over into March, so a date that comes back different didn't exist
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// "1990-03-05" → "05.03.1990."
export function formatBirthDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${day}.${month}.${year}.`
}
