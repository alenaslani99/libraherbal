import type { Product } from '~/data/home-mock'
import { shopProducts } from '~/data/products-mock'

// "Preporučeni proizvodi" on the product page: up to 4 products, never the one being viewed.
// To wire the backend, swap the handler for:
//   () => $fetch<Product[]>(`/api/products/${toValue(slug)}/recommended`)
export function useRecommendedProducts(slug: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `recommended-${toValue(slug)}`,
    async (): Promise<Product[]> => shopProducts.filter(p => p.slug !== toValue(slug)).slice(0, 4),
    { default: () => [] },
  )
}
