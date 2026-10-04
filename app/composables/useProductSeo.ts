import type { ProductDetail } from '#shared/types/product'
import { categoryBySlug } from '~/data/categories'

const DELIVERY = 'Dostava širom Srbije, plaćanje pouzećem.'
// Google shows ~60 characters of a title; titleTemplate adds " | Libra Herbal" (15)
const TITLE_MAX = 45
const DESCRIPTION_MAX = 160

// "Bronhi Med – prirodni med: propolis, nana" — ingredients are added while they fit
function productTitle(product: ProductDetail, kind: string) {
  let title = `${product.name} – ${kind}`
  const names = product.ingredients.map(i => i.name.toLowerCase())
  for (let i = names.length; i > 0; i--) {
    const candidate = `${title}: ${names.slice(0, i).join(', ')}`
    if (candidate.length <= TITLE_MAX) return candidate
  }
  return title.length <= TITLE_MAX ? title : product.name
}

// product text cut on a word boundary + the delivery line, ≤ 160 characters
function productDescription(product: ProductDetail) {
  const room = DESCRIPTION_MAX - DELIVERY.length - 2
  let text = product.description.trim()
  if (text.length > room) text = `${text.slice(0, room - 1).replace(/[\s,.;:–-]+\S*$/, '')}…`
  return text ? `${text} ${DELIVERY}` : `${product.name} (${product.weight}). ${DELIVERY}`
}

// Product page SEO: title with ingredients, description, canonical, og:image,
// plus Product (price in RSD, stock) and BreadcrumbList structured data.
export function useProductSeo(product: Ref<ProductDetail | null | undefined>) {
  const absolute = useAbsoluteUrl()
  const category = computed(() => product.value && categoryBySlug(product.value.categorySlug))

  usePageSeo({
    title: () => product.value ? productTitle(product.value, category.value?.productKind ?? product.value.category.toLowerCase()) : undefined,
    description: () => product.value ? productDescription(product.value) : undefined,
    image: () => product.value?.images[0]?.src ?? product.value?.image,
  })

  useJsonLd('product', () => {
    const p = product.value
    if (!p) return null
    const url = absolute(`/proizvodi/${p.slug}`)
    return {
      '@type': 'Product',
      'name': p.name,
      'description': p.description,
      'sku': p.slug,
      'image': p.images.map(img => absolute(img.src)),
      'brand': { '@type': 'Brand', 'name': 'Libra Herbal' },
      'category': category.value?.name ?? p.category,
      'size': p.weight,
      'url': url,
      'offers': {
        '@type': 'Offer',
        'url': url,
        'price': p.price.toFixed(2),
        'priceCurrency': 'RSD',
        'availability': p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'itemCondition': 'https://schema.org/NewCondition',
        // promotion end: Google shows the sale price only until then
        ...(p.regularPrice && p.saleEndsAt && { priceValidUntil: p.saleEndsAt.slice(0, 10) }),
      },
      // only with real, approved reviews: Google penalises made-up ratings
      ...(p.reviewCount > 0 && {
        aggregateRating: { '@type': 'AggregateRating', 'ratingValue': p.rating, 'reviewCount': p.reviewCount },
      }),
    }
  })

  useJsonLd('breadcrumb', () => {
    const p = product.value
    if (!p) return null
    const crumbs: [string, string][] = [['Početna', '/'], ['Proizvodi', '/proizvodi']]
    if (category.value) crumbs.push([category.value.name, category.value.path])
    crumbs.push([p.name, `/proizvodi/${p.slug}`])
    return breadcrumbLd(crumbs, absolute)
  })
}
