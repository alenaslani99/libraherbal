import { toRaw } from 'vue'
import type { HeroElementInput, HeroElementType } from '#shared/schemas/site'

// Element types offered in /admin/pocetna under "Dodaj element"
export const heroElementTypes: Record<HeroElementType, { label: string, icon: string, hint: string }> = {
  eyebrow: { label: 'Natpis', icon: 'lucide:tag', hint: 'Mala oznaka iznad naslova („NOVO", „AKCIJA -20%")' },
  heading: { label: 'Naslov', icon: 'lucide:heading-1', hint: 'Veliki naslov, do 3 reda (beli ili žuti)' },
  text: { label: 'Tekst', icon: 'lucide:pilcrow', hint: 'Kraći pasus ispod naslova' },
  buttons: { label: 'Dugmad', icon: 'lucide:mouse-pointer-click', hint: '1–3 dugmeta sa linkom' },
  rating: { label: 'Ocena', icon: 'lucide:star', hint: 'Zvezdice iz odobrenih recenzija ili ručno' },
  badge: { label: 'Oznaka', icon: 'lucide:award', hint: 'Podebljan naslov i tekst ispod („Proizvedeno u Srbiji")' },
  checklist: { label: 'Lista prednosti', icon: 'lucide:list-checks', hint: 'Do 5 redova sa kvačicom' },
  countdown: { label: 'Odbrojavanje', icon: 'lucide:timer', hint: 'Do datuma, npr. kraj akcije; posle se samo sakrije' },
  product: { label: 'Istaknuti proizvod', icon: 'lucide:package', hint: 'Slika, naziv i cena proizvoda sa linkom' },
}

const newId = () => crypto.randomUUID().slice(0, 8)

// a fresh element with placeholder content the admin then edits
export function newHeroElement(type: HeroElementType): HeroElementInput {
  const id = newId()
  switch (type) {
    case 'eyebrow': return { id, type, text: 'Novo' }
    case 'heading': return { id, type, lines: [{ text: 'Naslov', accent: false }] }
    case 'text': return { id, type, text: '' }
    case 'buttons': return { id, type, buttons: [{ label: 'Istražite proizvode', link: '/proizvodi', style: 'solid' }] }
    case 'rating': return { id, type, label: 'prosečna ocena', override: null }
    case 'badge': return { id, type, title: '', text: '' }
    case 'checklist': return { id, type, items: [''] }
    // a week from now, on the hour
    case 'countdown': return { id, type, label: 'Akcija ističe za', endsAt: new Date(Math.ceil(Date.now() / 3_600_000) * 3_600_000 + 7 * 86_400_000).toISOString() }
    case 'product': return { id, type, label: 'Proizvod meseca', productId: 0 }
  }
}

export function copyHeroElement(element: HeroElementInput): HeroElementInput {
  return { ...structuredClone(toRaw(element)), id: newId() }
}
