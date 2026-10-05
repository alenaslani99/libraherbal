// "5.10.2026." from the post's frontmatter date. Read from the ISO string, not new Date(),
// so the server and the browser never disagree by a day because of time zones.
export function formatPostDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number)
  return `${day}.${month}.${year}.`
}
