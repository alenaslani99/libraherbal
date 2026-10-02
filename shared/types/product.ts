// Product page contract — the shape GET /api/products/:slug will return.
// Lives in shared/ so the server routes and the app use the same types.

export interface ProductImage {
  src: string
  alt: string
}

// One purchasable size of a product (250 g, 500 g, 1 kg) — price and stock are per variant
export interface ProductVariant {
  id: number
  label: string
  // display price as the backend sends it, e.g. "1.490"
  price: string
  inStock: boolean
}

// One accordion block on the product page (Način upotrebe, Nutritivna vrednost, Dostava)
export interface ProductInfoSection {
  title: string
  body: string
}

// One entry in the "Sastojci" section
export interface ProductIngredient {
  name: string
  description: string
}

export interface ProductDetail {
  id: number
  slug: string
  name: string
  // eyebrow: "MED • DISANJE"
  category: string
  purpose: string
  description: string
  rating: number
  reviewCount: number
  images: ProductImage[]
  variants: ProductVariant[]
  defaultVariantId: number
  info: ProductInfoSection[]
  ingredients: ProductIngredient[]
}
