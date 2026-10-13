import type { CategoryHero } from './categories'

// Copy for /proizvodi (all products). Category pages have their own in ./categories.ts
export const productsPage = {
  // <title> without the brand, ≤ 45 characters
  title: 'Prodavnica: med, biljni čajevi i melemi',
  description: 'Svi Libra Herbal proizvodi na jednom mestu: med sa propolisom i đumbirom, čajevi za varenje i san, melemi za zglobove. Pouzećem, dostava širom Srbije.',
  hero: {
    eyebrow: 'Pronađite svoj dobar ritual',
    titleLine1: 'Prirodni med,',
    titleLine2: 'čajevi i melemi.',
    text: 'Birajte po biljci, ukusu ili onome što vam je ovog trenutka potrebno.',
    images: ['/assets/img/med-kopriva.jpg', '/assets/img/uro-balans.jpg'],
  } satisfies CategoryHero,
}
