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
