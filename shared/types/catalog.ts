// /admin/kategorije: categories, purposes ("Svrha") and ingredients

export interface AdminCategory {
  id: number
  name: string
  slug: string
  productCount: number
  // shown in the shop
  activeCount: number
}

export interface AdminPurpose {
  id: number
  name: string
  slug: string
  productCount: number
}

export interface AdminIngredient {
  id: number
  name: string
  // '' = none yet
  description: string
  // names of the products that use it
  products: string[]
}
