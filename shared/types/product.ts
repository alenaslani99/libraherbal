// Catalog contracts — the shapes the /api/products* routes return.
// Lives in shared/ so the server routes and the app use the same types.

// A product card (listings, home "Popularni artikli", "Preporučeni proizvodi")
export interface Product {
  id: number
  slug: string
  name: string
  // eyebrow: "MED • 500g"
  category: string
  weight: string
  // RSD, e.g. 1490 — the UI prints it as "1490,00 RSD"
  price: number
  image: string
}

// One option in a filter group or the sort dropdown
export interface FilterOption {
  value: string
  label: string
}

// GET /api/filters — "Vrsta proizvoda" (categories) and "Svrha" (purposes)
export interface CatalogFilters {
  types: FilterOption[]
  purposes: FilterOption[]
}

export interface ProductImage {
  src: string
  alt: string
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

export interface ProductDetail extends Product {
  // categories.slug (med, caj, melem): links the product to its category page
  categorySlug: string
  // eyebrow: "MED • DISANJE"
  purpose: string
  description: string
  rating: number
  reviewCount: number
  inStock: boolean
  images: ProductImage[]
  info: ProductInfoSection[]
  ingredients: ProductIngredient[]
}

// GET /api/products — one page of the filtered, sorted listing
export interface ProductPage {
  items: Product[]
  // all matches across pages ("19 proizvoda")
  total: number
  page: number
  pageCount: number
}
