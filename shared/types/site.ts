import type { HeroSettings } from '#shared/schemas/site'

// Editable site content — API shapes

// GET /api/hero — what the home page shows
export type Hero = Omit<HeroSettings, 'showRating' | 'ratingOverride'> & {
  // the admin's number, else the approved reviews' average; null = no rating badge
  rating: number | null
}

// GET /api/admin/hero — the saved settings (defaults until the first save) and the real average
export interface AdminHero {
  settings: HeroSettings
  defaults: HeroSettings
  reviewAverage: number | null
  reviewCount: number
}
