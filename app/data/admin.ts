// Admin sidebar. `soon`: the page isn't built yet, so the link is shown disabled.
export interface AdminNavItem {
  label: string
  to: string
  icon: string
  soon?: boolean
}

export const adminNav: { title?: string, items: AdminNavItem[] }[] = [
  {
    items: [
      { label: 'Pregled', to: '/admin', icon: 'lucide:layout-dashboard' },
    ],
  },
  {
    title: 'Prodavnica',
    items: [
      { label: 'Porudžbine', to: '/admin/porudzbine', icon: 'lucide:shopping-bag' },
      { label: 'Proizvodi', to: '/admin/proizvodi', icon: 'lucide:package' },
      { label: 'Kategorije', to: '/admin/kategorije', icon: 'lucide:folder-tree', soon: true },
    ],
  },
  {
    title: 'Sadržaj',
    items: [
      { label: 'Blog', to: '/admin/blog', icon: 'lucide:newspaper' },
    ],
  },
  {
    title: 'Kupci',
    items: [
      { label: 'Korisnici', to: '/admin/korisnici', icon: 'lucide:users', soon: true },
      { label: 'Poruke', to: '/admin/poruke', icon: 'lucide:mail' },
    ],
  },
]
