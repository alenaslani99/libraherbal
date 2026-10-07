import type { Hero } from '#shared/types/site'

// GET /api/hero — the home page hero, written in /admin/pocetna
export default defineEventHandler(async (event): Promise<Hero> => {
  const { showRating, ratingOverride, ...hero } = await heroSettings(event)
  const rating = showRating ? (ratingOverride ?? (await reviewStats(event)).average) : null
  return { ...hero, rating }
})
