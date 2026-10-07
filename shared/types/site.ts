import type { HeroElement, HeroSettings } from '#shared/schemas/site'
import type { Product } from '#shared/types/product'

// Editable site content — API shapes

// One hero element as the page draws it: the rating carries its number, the product its card
export type HeroBlock
  = | Exclude<HeroElement, { type: 'rating' | 'product' }>
    | { id: string, type: 'rating', label: string, value: number }
    | { id: string, type: 'product', label: string, product: Product }

// GET /api/hero — what the home page shows; elements that have nothing to show are left out
export type Hero = Omit<HeroSettings, 'elements'> & { elements: HeroBlock[] }

// GET /api/admin/hero — the saved settings (defaults until the first save), plus what the
// form and its live preview need: the real review average and the products that can be featured
export interface AdminHero {
  settings: HeroSettings
  defaults: HeroSettings
  reviewAverage: number | null
  reviewCount: number
  products: Product[]
}
