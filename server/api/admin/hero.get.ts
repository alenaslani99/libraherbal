import type { AdminHero } from '#shared/types/site'

// GET /api/admin/hero — the form's values plus what its live preview needs
export default defineEventHandler(async (event): Promise<AdminHero> => {
  await requireAdmin(event)
  const [settings, stats, products] = await Promise.all([heroSettings(event), reviewStats(event), productCards(event)])
  return { settings, defaults: HERO_DEFAULTS, reviewAverage: stats.average, reviewCount: stats.count, products }
})
