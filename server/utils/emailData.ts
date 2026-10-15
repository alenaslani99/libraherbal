import type { D1Database } from '@cloudflare/workers-types'
import type { FeaturedProduct } from './emailLayout'

// Data shared by the coupon emails (welcome, birthday).

// the product shown in the email; fixed for now, later chosen in the admin
const FEATURED_SLUG = 'bronhi-med'

// day.month.year. in Serbian time, e.g. "14.11.2026."
export function serbianDate(date: Date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Belgrade', day: '2-digit', month: '2-digit', year: 'numeric' })
    .formatToParts(date).map(p => [p.type, p.value]))
  return `${parts.day}.${parts.month}.${parts.year}.`
}

// the day a code made now stops working
export function couponValidUntil(days: number) {
  return serbianDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000))
}

// null = the product is inactive, has no price or photo; the email then leaves the block out
export async function loadFeaturedProduct(db: D1Database): Promise<FeaturedProduct | null> {
  const row = await db.prepare(`
    SELECT v.name, v.slug, p.description, v.primary_image, v.final_price, v.rating_avg, v.rating_count
    FROM v_product_card v JOIN products p ON p.id = v.id
    WHERE v.slug = ?1 AND v.final_price IS NOT NULL
  `).bind(FEATURED_SLUG).first<{ name: string, slug: string, description: string | null, primary_image: string | null, final_price: number, rating_avg: number, rating_count: number }>()
  if (!row?.primary_image) return null
  // amounts are in para (1 RSD = 100), the email shows RSD
  return { name: row.name, slug: row.slug, description: row.description ?? '', image: row.primary_image, price: row.final_price / 100, rating: row.rating_avg, ratingCount: row.rating_count }
}
