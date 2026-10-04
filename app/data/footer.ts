import type { NavLink } from './navigation'

export const footerAbout = 'Kao mala porodična proizvodnja nastala 2025. godine, pomažemo ljudima da se lakše nose sa svakodnevnim problemima uz pomoć prirodnih preparata.'

export const footerColumns: { title: string, links: NavLink[] }[] = [
  {
    title: 'Informacije',
    links: [
      { label: 'O nama', to: '/o-nama' },
      { label: 'Kontakt', to: '/kontakt' },
      { label: 'Česta pitanja', to: '/cesta-pitanja' },
      { label: 'Prati porudžbinu', to: '/prati-porudzbinu' },
    ],
  },
  {
    title: 'Navigacija',
    links: [
      { label: 'Glavna stranica', to: '/' },
      { label: 'Proizvodi', to: '/proizvodi' },
      { label: 'Korpa', to: '/korpa' },
      { label: 'Nalog', to: '/nalog' },
    ],
  },
]

// bottom bar, next to the copyright; cookies are a section of the privacy policy
export const footerLegal: NavLink[] = [
  { label: 'Politika privatnosti', to: '/politika-privatnosti' },
  { label: 'Uslovi korišćenja', to: '/uslovi-koriscenja' },
  { label: 'Politika kolačića', to: '/politika-privatnosti#kolacici' },
]

const address = {
  street: 'Miloša Velikog BB',
  city: 'Velika Plana',
  postalCode: '11320',
  country: 'RS',
}

export const contact = {
  phone: '+381 62 607444',
  email: 'info@libraherbal.rs',
  address,
}

// Brand logos come from Simple Icons (Lucide has no brand logos)
export const socials = [
  { label: 'Facebook', icon: 'simple-icons:facebook', href: 'https://facebook.com' },
  { label: 'Instagram', icon: 'simple-icons:instagram', href: 'https://instagram.com' },
  { label: 'YouTube', icon: 'simple-icons:youtube', href: 'https://youtube.com' },
  { label: 'TikTok', icon: 'simple-icons:tiktok', href: 'https://tiktok.com' },
]
