import type { Product } from '#shared/types/product'

// A row of v_product_card (see migrations/0002_product_sales.sql)
export interface ProductCardRow {
  id: number
  name: string
  slug: string
  weight_label: string | null
  category_id: number
  stock: number
  category_name: string
  category_slug: string
  regular_price: number | null
  sale_price: number | null
  final_price: number | null
  primary_image: string | null
  primary_image_alt: string | null
  rating_avg: number
  rating_count: number
  units_sold: number
}

export function toProduct(row: ProductCardRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_name,
    weight: row.weight_label ?? '',
    // stored in para (1 RSD = 100)
    price: (row.final_price ?? 0) / 100,
    // sale_price is only set while the promotion is running (v_product_current_price)
    ...(row.sale_price !== null && row.regular_price !== null && row.regular_price > row.sale_price
      ? { regularPrice: row.regular_price / 100 }
      : {}),
    image: row.primary_image ?? '',
  }
}
