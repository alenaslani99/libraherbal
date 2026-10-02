import type { ProductDetail } from '#shared/types/product'
import { getMockProductDetail } from '~/data/product-detail-mock'

// Product page data. To wire the backend, swap the handler for:
//   () => $fetch<ProductDetail>(`/api/products/${toValue(slug)}`)
// (the API should answer 404 for unknown slugs; the page already handles a missing product)
export function useProduct(slug: MaybeRefOrGetter<string>) {
  return useAsyncData(
    () => `product-${toValue(slug)}`,
    async (): Promise<ProductDetail | null> => getMockProductDetail(toValue(slug)),
  )
}
