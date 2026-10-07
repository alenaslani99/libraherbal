import type { H3Event } from 'h3'
import { heroSchema, type HeroSettings } from '#shared/schemas/site'

// What the hero showed before it was editable; used until the admin saves it the first time
export const HERO_DEFAULTS: HeroSettings = {
  titleLine1: 'Prirodno rešenje',
  titleLine2: 'vaših problema.',
  subtitle: 'Domaći medovi, čajevi i melemi za rešavanje akutnih i hroničnih problema.',
  image: '/assets/img/hero.jpg',
  imageAlt: '',
  primaryLabel: 'Istražite proizvode',
  primaryLink: '/proizvodi',
  secondaryLabel: 'Naša priča',
  secondaryLink: '/o-nama',
  showRating: true,
  ratingOverride: null,
  ratingLabel: 'prosečna ocena',
  badgeTitle: 'Proizvedeno u Srbiji',
  badgeText: 'od košnice do tegle',
}

// The saved hero, or the defaults while there's no (valid) row
export async function heroSettings(event: H3Event): Promise<HeroSettings> {
  const row = await useDb(event).prepare(`SELECT value FROM site_settings WHERE key = 'hero'`)
    .first<{ value: string }>()
  const result = row ? heroSchema.safeParse(JSON.parse(row.value)) : null
  return result?.success ? result.data : HERO_DEFAULTS
}

// Approved reviews across all products; average rounded to one decimal, null when there are none
export async function reviewStats(event: H3Event) {
  const row = await useDb(event).prepare(`
    SELECT ROUND(AVG(rating), 1) AS average, COUNT(*) AS count FROM reviews WHERE is_approved = 1
  `).first<{ average: number | null, count: number }>()
  return { average: row?.average ?? null, count: row?.count ?? 0 }
}
