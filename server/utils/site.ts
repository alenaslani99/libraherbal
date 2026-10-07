import type { H3Event } from 'h3'
import { heroSchema, type HeroSettings } from '#shared/schemas/site'
import type { Product } from '#shared/types/product'

// What the hero showed before it was editable; used until the admin saves it the first time
export const HERO_DEFAULTS: HeroSettings = {
  image: '/assets/img/hero.jpg',
  imageAlt: '',
  overlay: 'medium',
  align: 'left',
  height: 'tall',
  elements: [
    { id: 'heading', type: 'heading', lines: [{ text: 'Prirodno rešenje', accent: false }, { text: 'vaših problema.', accent: true }] },
    { id: 'text', type: 'text', text: 'Domaći medovi, čajevi i melemi za rešavanje akutnih i hroničnih problema.' },
    {
      id: 'buttons',
      type: 'buttons',
      buttons: [
        { label: 'Istražite proizvode', link: '/proizvodi', style: 'solid' },
        { label: 'Naša priča', link: '/o-nama', style: 'outline' },
      ],
    },
    { id: 'rating', type: 'rating', label: 'prosečna ocena', override: null },
    { id: 'badge', type: 'badge', title: 'Proizvedeno u Srbiji', text: 'od košnice do tegle' },
  ],
}

// The first editable hero had fixed fields (titleLine1, subtitle, primaryLabel…); turn a row
// saved in that shape into elements so it keeps showing until the admin saves again.
function fromFixedFields(old: Record<string, any>): unknown {
  const elements: unknown[] = []
  const lines = [{ text: old.titleLine1, accent: false }, { text: old.titleLine2, accent: true }].filter(l => l.text)
  if (lines.length) elements.push({ id: 'heading', type: 'heading', lines })
  if (old.subtitle) elements.push({ id: 'text', type: 'text', text: old.subtitle })
  const buttons = [{ label: old.primaryLabel, link: old.primaryLink, style: 'solid' }]
  if (old.secondaryLabel && old.secondaryLink) buttons.push({ label: old.secondaryLabel, link: old.secondaryLink, style: 'outline' })
  elements.push({ id: 'buttons', type: 'buttons', buttons })
  if (old.showRating !== false) elements.push({ id: 'rating', type: 'rating', label: old.ratingLabel ?? '', override: old.ratingOverride ?? null })
  if (old.badgeTitle) elements.push({ id: 'badge', type: 'badge', title: old.badgeTitle, text: old.badgeText ?? '' })
  return { image: old.image, imageAlt: old.imageAlt, elements }
}

// The saved hero, or the defaults while there's no (valid) row
export async function heroSettings(event: H3Event): Promise<HeroSettings> {
  const row = await useDb(event).prepare(`SELECT value FROM site_settings WHERE key = 'hero'`)
    .first<{ value: string }>()
  if (!row) return HERO_DEFAULTS
  const saved = JSON.parse(row.value)
  const result = heroSchema.safeParse(Array.isArray(saved?.elements) ? saved : fromFixedFields(saved))
  return result.success ? result.data : HERO_DEFAULTS
}

// Approved reviews across all products; average rounded to one decimal, null when there are none
export async function reviewStats(event: H3Event) {
  const row = await useDb(event).prepare(`
    SELECT ROUND(AVG(rating), 1) AS average, COUNT(*) AS count FROM reviews WHERE is_approved = 1
  `).first<{ average: number | null, count: number }>()
  return { average: row?.average ?? null, count: row?.count ?? 0 }
}

// Active products as cards (v_product_card only has active ones); all of them when `ids` is left out
export async function productCards(event: H3Event, ids?: number[]): Promise<Product[]> {
  if (ids && !ids.length) return []
  const filter = ids ? `WHERE id IN (${ids.map(() => '?').join(', ')})` : ''
  const { results } = await useDb(event).prepare(`SELECT * FROM v_product_card ${filter} ORDER BY name COLLATE NOCASE`)
    .bind(...(ids ?? [])).all<ProductCardRow>()
  return results.map(toProduct)
}
