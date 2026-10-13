import type { ProductDetail } from '#shared/types/product'
import { categoryBySlug } from '~/data/categories'

// threshold = FREE_SHIPPING_FROM in server/utils/shipping.ts
const DELIVERY = 'Pouzećem, besplatna dostava od 4.000 RSD.'
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

// "{first sentence of the product text}. 370 ml, 1490,00 RSD. Pouzećem, besplatna dostava od 4.000 RSD."
// ≤ 160 characters: the first sentence when it fits, else cut at its last comma that fits
// ("…sa propolisom, nanom i divljim origanom."), else on a word boundary with "…"
function productDescription(product: ProductDetail) {
  const tail = `${product.weight ? `${product.weight}, ` : ''}${product.price},00 RSD. ${DELIVERY}`
  const room = DESCRIPTION_MAX - tail.length - 1
  const sentence = product.description.trim().match(/^.+?[.!?](?=\s|$)/s)?.[0] ?? product.description.trim()
  let text = sentence
  if (text.length > room) {
    const comma = sentence.lastIndexOf(',', room - 1)
    text = comma > room / 2
      ? `${sentence.slice(0, comma)}.`
      : `${sentence.slice(0, room - 1).replace(/[\s,.;:–-]+\S*$/, '')}…`
  }
  return text ? `${text} ${tail}` : `${product.name}, ${tail}`
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
