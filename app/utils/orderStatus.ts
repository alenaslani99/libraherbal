import type { OrderStatus } from '#shared/types/order'

// Status badge on "Istorija porudžbina" and /prati-porudzbinu
export const orderStatuses: Record<OrderStatus, { label: string, class: string }> = {
  received: { label: 'Primljena', class: 'bg-sun-light text-ink' },
  preparing: { label: 'U pripremi', class: 'bg-sun text-ink' },
  in_transit: { label: 'U transportu', class: 'bg-forest/15 text-forest' },
  delivered: { label: 'Isporučena', class: 'bg-forest text-white' },
  cancelled: { label: 'Otkazana', class: 'bg-red-700/10 text-red-700' },
}

// "30. septembar 2026."
export function formatOrderDate(iso: string) {
  return new Date(iso).toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Same statuses in the admin's neutral zinc look (badges, filter tabs)
export const adminOrderStatusClass: Record<OrderStatus, string> = {
  received: 'bg-amber-100 text-amber-800',
  preparing: 'bg-sky-100 text-sky-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
}

// "7.10.2026. 14:05" in local time, for the admin tables
export function formatAdminDateTime(iso: string) {
  return new Date(iso).toLocaleString('sr-Latn-RS', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
