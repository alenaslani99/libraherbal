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
      { label: 'Kategorije', to: '/admin/kategorije', icon: 'lucide:folder-tree' },
    ],
  },
  {
    title: 'Sadržaj',
    items: [
      { label: 'Početna strana', to: '/admin/pocetna', icon: 'lucide:panel-top' },
      { label: 'Blog', to: '/admin/blog', icon: 'lucide:newspaper' },
      { label: 'Utisci kupaca', to: '/admin/utisci', icon: 'lucide:quote' },
    ],
  },
  {
    title: 'Kupci',
    items: [
      { label: 'Poruke', to: '/admin/poruke', icon: 'lucide:mail' },
      { label: 'Recenzije', to: '/admin/recenzije', icon: 'lucide:star' },
      { label: 'Newsletter', to: '/admin/newsletter', icon: 'lucide:send' },
    ],
  },
]
