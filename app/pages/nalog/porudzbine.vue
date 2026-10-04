<script setup lang="ts">
import type { OrderHistoryItem, OrderStatus } from '#shared/types/order'

// "Istorija porudžbina" tab
const { data: orders, status, refresh } = await useFetch<OrderHistoryItem[]>('/api/account/orders', {
  key: 'account-orders',
  default: () => [],
})

const statuses: Record<OrderStatus, { label: string, class: string }> = {
  received: { label: 'Primljena', class: 'bg-sun-light text-ink' },
  preparing: { label: 'U pripremi', class: 'bg-sun text-ink' },
  in_transit: { label: 'Na putu', class: 'bg-forest/15 text-forest' },
  delivered: { label: 'Isporučena', class: 'bg-forest text-white' },
  cancelled: { label: 'Otkazana', class: 'bg-red-700/10 text-red-700' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="max-w-[860px]">
    <h2 class="text-2xl leading-tight text-ink">
      Istorija porudžbina
    </h2>

    <p v-if="status === 'pending'" class="mt-6 text-sm text-brown-200" role="status">
      Učitavamo porudžbine…
    </p>

    <div v-else-if="status === 'error'" class="mt-6 rounded-md border border-sun bg-sun-light/60 px-4 py-3 text-sm text-ink" role="alert">
      Porudžbine trenutno nije moguće učitati.
      <button type="button" class="font-semibold underline underline-offset-4 hover:text-forest" @click="refresh()">
        Pokušajte ponovo
      </button>
    </div>

    <div v-else-if="!orders.length" class="mt-6 flex flex-col items-center rounded-xl border border-dashed border-line px-6 py-14 text-center">
      <Icon name="lucide:package" class="size-10 text-brown-200" />
      <p class="mt-4 text-sm text-ink">
        Još uvek nemate porudžbina.
      </p>
      <BaseButton to="/proizvodi" size="lg" class="mt-6 font-medium">
        Pogledajte proizvode
      </BaseButton>
    </div>

    <ul v-else class="mt-6 space-y-4">
      <li v-for="order in orders" :key="order.orderNumber" class="rounded-xl border border-line bg-white/30">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <p class="text-sm font-semibold text-ink">
              #{{ order.orderNumber }}
            </p>
            <p class="mt-0.5 text-xs text-brown-200">
              {{ formatDate(order.placedAt) }}
            </p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statuses[order.status].class">
            {{ statuses[order.status].label }}
          </span>
        </div>

        <ul class="space-y-2 px-5 py-4 text-sm sm:px-6">
          <li v-for="(item, i) in order.items" :key="i" class="flex justify-between gap-4 text-ink">
            <span>{{ item.name }} <span class="text-brown-200">× {{ item.quantity }}</span></span>
            <span class="shrink-0">{{ item.lineTotal }},00 RSD</span>
          </li>
        </ul>

        <div class="flex justify-between gap-4 border-t border-line px-5 py-3 text-sm font-semibold text-ink sm:px-6">
          <span>Ukupno</span>
          <span>{{ order.total }},00 RSD</span>
        </div>
      </li>
    </ul>
  </div>
</template>
