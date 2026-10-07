import type { Hero } from '#shared/types/site'

// GET /api/hero — the home page hero, written in /admin/pocetna
export default defineEventHandler(async (event): Promise<Hero> => {
  const settings = await heroSettings(event)
  const productIds = settings.elements.flatMap(e => (e.type === 'product' ? [e.productId] : []))
  const needsAverage = settings.elements.some(e => e.type === 'rating' && e.override === null)

  const [stats, products] = await Promise.all([
    needsAverage ? reviewStats(event) : null,
    productCards(event, productIds),
  ])
  return resolveHero(settings, { reviewAverage: stats?.average ?? null, products, now: Date.now() })
})
