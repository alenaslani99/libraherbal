import type { Product } from '#shared/types/product'

// "Preporučeni proizvodi" on the product page: up to 4 products, never the one being viewed.
export function useRecommendedProducts(slug: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `recommended-${toValue(slug)}`,
    () => $fetch<Product[]>(`/api/products/${encodeURIComponent(toValue(slug))}/recommended`),
    { default: () => [] },
  )
}
