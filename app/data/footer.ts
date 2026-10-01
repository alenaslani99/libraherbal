import type { NavLink } from './navigation'

export const footerAbout = 'Kao mala porodična proizvodnja nastala 2025. godine, pomažemo ljudima da se lakše nose sa svakodnevnim problemima uz pomoć prirodnih preparata.'

export const footerNav: NavLink[] = [
  { label: 'Glavna stranica', to: '/' },
  { label: 'Proizvodi', to: '/prodavnica' },
  { label: 'Korpa', to: '/korpa' },
  { label: 'O nama', to: '/o-nama' },
  { label: 'Česta pitanja', to: '/cesta-pitanja' },
  { label: 'Politika privatnosti', to: '/politika-privatnosti' },
]

export const contact = {
  phone: '+381 62 607444',
  email: 'info@libraherbal.rs',
}

// Brand logos come from Simple Icons (Lucide has no brand logos)
export const socials = [
  { label: 'Facebook', icon: 'simple-icons:facebook', href: 'https://facebook.com' },
  { label: 'Instagram', icon: 'simple-icons:instagram', href: 'https://instagram.com' },
  { label: 'YouTube', icon: 'simple-icons:youtube', href: 'https://youtube.com' },
  { label: 'TikTok', icon: 'simple-icons:tiktok', href: 'https://tiktok.com' },
]
