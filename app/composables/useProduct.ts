import type { ProductDetail } from '#shared/types/product'

// Product page data. The API answers 404 for unknown slugs; that becomes null here
// and the page throws its own 404.
export function useProduct(slug: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `product-${toValue(slug)}`,
    async (): Promise<ProductDetail | null> => {
      try {
        return await $fetch<ProductDetail>(`/api/products/${encodeURIComponent(toValue(slug))}`)
      }
      catch (error) {
        if ((error as { statusCode?: number }).statusCode === 404) return null
        throw error
      }
    },
  )
}
