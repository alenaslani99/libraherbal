import type { CategoryHero } from './categories'

// Copy for /proizvodi (all products). Category pages have their own in ./categories.ts
export const productsPage = {
  // <title> without the brand, ≤ 45 characters
  title: 'Prirodni čajevi, med i melemi',
  description: 'Prodavnica prirodnih proizvoda: domaći med sa lekovitim biljem, biljni čajevi i melemi od prirodnih ulja. Dostava širom Srbije, plaćanje pouzećem.',
  hero: {
    eyebrow: 'Pronađite svoj dobar ritual',
    titleLine1: 'Prirodni med,',
    titleLine2: 'čajevi i melemi.',
    text: 'Birajte po biljci, ukusu ili onome što vam je ovog trenutka potrebno.',
    images: ['/assets/img/med-kopriva.jpg', '/assets/img/uro-balans.jpg'],
  } satisfies CategoryHero,
}
