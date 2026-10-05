// "Kopriva u svakodnevnoj ishrani" → "kopriva-u-svakodnevnoj-ishrani" (Serbian Latin letters without diacritics)
const LETTERS: Record<string, string> = { č: 'c', ć: 'c', š: 's', ž: 'z', đ: 'dj' }

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[čćšžđ]/g, c => LETTERS[c]!)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/, '')
}
