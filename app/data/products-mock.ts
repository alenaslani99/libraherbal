// Mock catalog until the backend exists — categories and products will come from D1
import type { Product } from './home-mock'

export interface FilterOption {
  value: string
  label: string
}

export interface ShopProduct extends Product {
  type: string
  purposes: string[]
  // stand-in for a real popularity metric (sales count) — higher = more popular
  popularity: number
}

// "Vrsta proizvoda"
export const productTypes: FilterOption[] = [
  { value: 'med', label: 'Med' },
  { value: 'caj', label: 'Čaj' },
  { value: 'melem', label: 'Melem' },
  { value: 'setovi', label: 'Setovi' },
]

// "Svrha" — values match the home page category slugs (/proizvodi?kategorija=…)
export const productPurposes: FilterOption[] = [
  { value: 'imunitet', label: 'Imunitet' },
  { value: 'krvna-slika', label: 'Krvna slika' },
  { value: 'varenje-i-prostata', label: 'Varenje' },
  { value: 'energija', label: 'Energija' },
  { value: 'smirenje-i-spavanje', label: 'Smirenje' },
]

export const sortOptions: FilterOption[] = [
  { value: 'popularnost', label: 'Popularnost' },
  { value: 'cena-rastuce', label: 'Cena: od najniže' },
  { value: 'cena-opadajuce', label: 'Cena: od najviše' },
  { value: 'naziv', label: 'Naziv: A–Z' },
]

export const shopProducts: ShopProduct[] = [
  { id: 1, variantId: 12, slug: 'bronhi-med', name: 'Bronhi Med', category: 'Med', weight: '500g', price: '1.490', image: '/assets/img/med-kopriva.jpg', type: 'med', purposes: ['imunitet'], popularity: 98 },
  { id: 2, variantId: 20, slug: 'cisto-med', name: 'Cisto Med', category: 'Med', weight: '500g', price: '1.200', image: '/assets/img/cisto-med.jpg', type: 'med', purposes: ['krvna-slika'], popularity: 91 },
  { id: 3, variantId: 30, slug: 'urobalans', name: 'UroBalans', category: 'Čaj', weight: '100g', price: '700', image: '/assets/img/uro-balans.jpg', type: 'caj', purposes: ['varenje-i-prostata'], popularity: 87 },
  { id: 4, variantId: 40, slug: 'opustise', name: 'OpustiSe', category: 'Čaj', weight: '100g', price: '700', image: '/assets/img/opusti-se.jpg', type: 'caj', purposes: ['smirenje-i-spavanje'], popularity: 84 },
  { id: 5, variantId: 50, slug: 'med-sa-koprivom', name: 'Med sa koprivom', category: 'Med', weight: '500g', price: '1.100', image: '/assets/img/med-kopriva.jpg', type: 'med', purposes: ['krvna-slika', 'energija'], popularity: 79 },
  { id: 6, variantId: 60, slug: 'energi-med', name: 'Energi Med', category: 'Med', weight: '250g', price: '850', image: '/assets/img/cisto-med.jpg', type: 'med', purposes: ['energija'], popularity: 72 },
  { id: 7, variantId: 70, slug: 'imuno-caj', name: 'Imuno Čaj', category: 'Čaj', weight: '100g', price: '650', image: '/assets/img/uro-balans.jpg', type: 'caj', purposes: ['imunitet'], popularity: 70 },
  { id: 8, variantId: 80, slug: 'neven-melem', name: 'Neven Melem', category: 'Melem', weight: '50ml', price: '950', image: '/assets/img/opusti-se.jpg', type: 'melem', purposes: ['imunitet'], popularity: 61 },
  { id: 9, variantId: 90, slug: 'set-za-imunitet', name: 'Set za imunitet', category: 'Set', weight: '3 kom', price: '2.400', image: '/assets/img/med-kopriva.jpg', type: 'setovi', purposes: ['imunitet', 'energija'], popularity: 58 },
  { id: 10, variantId: 100, slug: 'miran-san', name: 'Miran San', category: 'Čaj', weight: '100g', price: '700', image: '/assets/img/opusti-se.jpg', type: 'caj', purposes: ['smirenje-i-spavanje'], popularity: 49 },
  { id: 11, variantId: 110, slug: 'set-dobro-varenje', name: 'Set Dobro varenje', category: 'Set', weight: '2 kom', price: '1.800', image: '/assets/img/uro-balans.jpg', type: 'setovi', purposes: ['varenje-i-prostata'], popularity: 40 },
]
