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
  // only while a promotion is active: the price before the discount (RSD), shown struck through
  regularPrice?: number
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
  // last moment of the promotion, ISO date-time (UTC); null = no end date or no promotion
  saleEndsAt: string | null
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

// ---------------------------------------------------------------------
//  Admin (/admin/proizvodi); prices in RSD, dates ISO
// ---------------------------------------------------------------------

// One row of the admin product list
export interface AdminProductListItem {
  id: number
  name: string
  slug: string
  weight: string
  category: string
  // null = no price yet (the product can't be shown or bought)
  price: number | null
  // set only while a promotion is running
  salePrice: number | null
  stock: number
  image: string
  isActive: boolean
  popular: boolean
  unitsSold: number
  updatedAt: string
}

// GET /api/admin/products/:id — the edit form (same fields as adminProductSchema) + read-only extras
export interface AdminProduct {
  id: number
  name: string
  slug: string
  categoryId: number
  weightLabel: string
  isActive: boolean
  popular: boolean
  description: string
  usageInstructions: string
  nutritionInfo: string
  price: number | null
  salePrice: number | null
  saleStartsAt: string
  saleEndsAt: string
  stock: number
  images: { src: string, alt: string }[]
  purposeIds: number[]
  ingredientIds: number[]
  recommendedIds: number[]
  unitsSold: number
  createdAt: string
  updatedAt: string
}

// GET /api/admin/catalog/options — choices for the product form
export interface AdminCatalogOptions {
  categories: { id: number, name: string, isActive: boolean }[]
  purposes: { id: number, name: string }[]
  ingredients: { id: number, name: string }[]
}
