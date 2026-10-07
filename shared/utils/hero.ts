import type { HeroInput } from '#shared/schemas/site'
import type { Hero, HeroBlock } from '#shared/types/site'
import type { Product } from '#shared/types/product'

// Saved hero → what the page draws. Used by GET /api/hero and by the admin's live preview,
// so both leave out the same things: a rating with no number, a product that isn't active,
// a countdown that has already ended.
export function resolveHero(
  settings: HeroInput,
  context: { reviewAverage: number | null, products: Product[], now: number },
): Hero {
  const elements: HeroBlock[] = []
  for (const element of settings.elements) {
    if (element.type === 'rating') {
      const override = element.override === '' || element.override == null ? null : Number(element.override)
      const value = override !== null && override >= 1 && override <= 5 ? override : context.reviewAverage
      if (value !== null) elements.push({ id: element.id, type: 'rating', label: element.label ?? '', value })
    }
    else if (element.type === 'product') {
      const product = context.products.find(p => p.id === element.productId)
      if (product) elements.push({ id: element.id, type: 'product', label: element.label ?? '', product })
    }
    else if (element.type === 'countdown') {
      if (Date.parse(element.endsAt) > context.now) elements.push({ ...element, label: element.label ?? '' })
    }
    else {
      elements.push(element as HeroBlock)
    }
  }
  return {
    image: settings.image,
    imageAlt: settings.imageAlt ?? '',
    overlay: settings.overlay ?? 'medium',
    align: settings.align ?? 'left',
    height: settings.height ?? 'tall',
    elements,
  }
}
