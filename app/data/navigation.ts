export interface NavLink {
  label: string
  to: string
}

export const mainNav: NavLink[] = [
  { label: 'Prodavnica', to: '/proizvodi' },
  { label: 'O nama', to: '/o-nama' },
  { label: 'Blog', to: '/blog' },
  { label: 'Kontakt', to: '/kontakt' },
]

export const topBarItems: string[] = [
  'Besplatna dostava za sve porudžbine preko 4.000 RSD',
  'Isporuka širom Srbije',
]
