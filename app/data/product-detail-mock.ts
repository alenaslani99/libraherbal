// Mock product detail until GET /api/products/:slug exists.
// Bronhi Med is the fully designed product; other catalog slugs get a detail page built from
// their listing data + shared placeholder copy, so every product card leads somewhere.
import type { ProductDetail, ProductInfoSection } from '#shared/types/product'
import { productPurposes, shopProducts } from './products-mock'

const sharedInfo: ProductInfoSection[] = [
  {
    title: 'Način upotrebe',
    body: 'Jedna kašičica dnevno, samostalno ili rastvorena u mlakoj vodi. Ne dodavati u ključalu tečnost.',
  },
  {
    title: 'Nutritivna vrednost',
    body: 'Na 100 g: energetska vrednost 1.360 kJ / 320 kcal, ugljeni hidrati 80 g (od čega šećeri 78 g), proteini 0,3 g, masti 0 g.',
  },
  {
    title: 'Dostava',
    body: 'Isporuka širom Srbije za 1–3 radna dana, plaćanje pouzećem. Besplatna dostava za porudžbine preko 4.000 RSD.',
  },
]

const bronhiMed: ProductDetail = {
  id: 1,
  slug: 'bronhi-med',
  name: 'Bronhi Med',
  category: 'Med',
  purpose: 'Disanje',
  description: 'Bagremov med obogaćen pažljivo usitnjenim listom koprive iz domaće berbe. Blag, biljni i dovoljno svakodnevan.',
  rating: 4.5,
  reviewCount: 38,
  images: [
    { src: '/assets/img/med-kopriva.jpg', alt: 'Bronhi Med — tegla meda sa koprivom' },
    { src: '/assets/img/cisto-med.jpg', alt: 'Bronhi Med — tegla na kamenu sa saćem' },
    { src: '/assets/img/uro-balans.jpg', alt: 'Bronhi Med — uz biljni čaj' },
  ],
  variants: [
    { id: 11, label: '250 g', price: '790', inStock: true },
    { id: 12, label: '500 g', price: '1.490', inStock: true },
    { id: 13, label: '1 kg', price: '2.690', inStock: false },
  ],
  defaultVariantId: 12,
  info: sharedInfo,
  ingredients: [
    {
      name: 'Propolis',
      description: 'Poznat kao prirodni antibiotik, štiti organizam od bakterija, virusa i gljivica, umiruje grlo i jača imunitet.',
    },
    {
      name: 'Nana',
      description: 'Osvežava, umiruje stomak, ublažava kašalj i doprinosi boljoj probavi.',
    },
    {
      name: 'Ulje divljeg origana',
      description: 'Prirodno antimikrobno sredstvo, pomaže u borbi protiv infekcija i ojačava odbrambene mehanizme organizma.',
    },
  ],
}

export function getMockProductDetail(slug: string): ProductDetail | null {
  if (slug === bronhiMed.slug) return bronhiMed

  const listing = shopProducts.find(p => p.slug === slug)
  if (!listing) return null

  const purpose = productPurposes.find(p => p.value === listing.purposes[0])?.label ?? ''
  return {
    ...bronhiMed,
    id: listing.id,
    slug: listing.slug,
    name: listing.name,
    category: listing.category,
    purpose,
    images: [{ src: listing.image, alt: listing.name }, ...bronhiMed.images.slice(1)],
    variants: [{ id: listing.variantId, label: listing.weight, price: listing.price, inStock: true }],
    defaultVariantId: listing.variantId,
  }
}
