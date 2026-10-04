// Static home page content (catalog data comes from the API)

export const heroFeatures = [
  { icon: 'lucide:leaf', title: '100% domaći med', text: 'od proverenih pčelara' },
  { icon: 'hugeicons:eco-lab-01', title: 'Laboratorijski ispitan kvalitet', text: 'pravljeno od strane studenta farmacije' },
  { icon: 'lucide:ban', title: 'Bez konzervansa', text: 'i dodatnog šećera' },
]

export const homeCategories = [
  { slug: 'imunitet', name: 'Imunitet', icon: 'lucide:shield-plus' },
  { slug: 'krvna-slika', name: 'Krvna slika', icon: 'lucide:droplet' },
  { slug: 'varenje-i-prostata', name: 'Varenje i prostata', icon: 'lucide:worm' },
  { slug: 'energija', name: 'Energija', icon: 'lucide:zap' },
  { slug: 'smirenje-i-spavanje', name: 'Smirenje i spavanje', icon: 'lucide:moon-star' },
]

// avatar: Tailwind classes for the initials circle (no user photos yet)
export const testimonials = [
  { id: 1, rating: 4, text: 'Osetila sam znatnu razliku u energiji posle nekoliko nedelja pijenja čaja s kašikom meda.', author: 'Milica', avatar: 'bg-forest text-sun' },
  { id: 2, rating: 3, text: 'Nakon nekoliko nedelja korišćenja, primetio sam porast energije. Ukus je prijatan, čaj neizostavan deo života.', author: 'Petar', avatar: 'bg-sun text-ink' },
  { id: 3, rating: 5, text: 'Med mi je rešio sve probleme koje sam imala sa urinarnom inkontinencijom!', author: 'Jelena', avatar: 'bg-brown-200 text-white' },
]
