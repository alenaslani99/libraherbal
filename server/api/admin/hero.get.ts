import type { AdminHero } from '#shared/types/site'

// GET /api/admin/hero — the form's values plus the approved reviews' average next to the override
export default defineEventHandler(async (event): Promise<AdminHero> => {
  await requireAdmin(event)
  const [settings, stats] = await Promise.all([heroSettings(event), reviewStats(event)])
  return { settings, defaults: HERO_DEFAULTS, reviewAverage: stats.average, reviewCount: stats.count }
})
