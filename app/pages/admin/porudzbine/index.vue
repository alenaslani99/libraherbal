<script setup lang="ts">
import type { AdminOrderList, OrderStatus } from '#shared/types/order'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Porudžbine' })

const route = useRoute()
const router = useRouter()

// filters live in the URL (?status=&q=&page=), so back from an order returns to the same list
const status = computed(() => (typeof route.query.status === 'string' ? route.query.status : ''))
const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

const { data, status: fetchStatus, error } = await useFetch<AdminOrderList>('/api/admin/orders', {
  key: 'admin-orders',
  query: { status, q, page },
})

function setQuery(next: { status?: string, q?: string, page?: number }) {
  const merged = { status: status.value, q: q.value, page: page.value, ...next }
  router.replace({
    query: {
      ...(merged.status ? { status: merged.status } : {}),
      ...(merged.q ? { q: merged.q } : {}),
      ...(merged.page > 1 ? { page: String(merged.page) } : {}),
    },
  })
}

// search box: typed text goes to the URL after a short pause
const search = ref(q.value)
let timer: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => setQuery({ q: value.trim(), page: 1 }), 300)
})
onBeforeUnmount(() => clearTimeout(timer))

const tabs: { id: OrderStatus | '', label: string }[] = [
  { id: '', label: 'Sve' },
  { id: 'received', label: orderStatuses.received.label },
  { id: 'preparing', label: orderStatuses.preparing.label },
  { id: 'in_transit', label: orderStatuses.in_transit.label },
  { id: 'delivered', label: orderStatuses.delivered.label },
  { id: 'cancelled', label: orderStatuses.cancelled.label },
]

const pages = computed(() => (data.value ? Math.max(1, Math.ceil(data.value.total / data.value.pageSize)) : 1))
const from = computed(() => (data.value?.total ? (page.value - 1) * data.value.pageSize + 1 : 0))
const to = computed(() => Math.min(page.value * (data.value?.pageSize ?? 0), data.value?.total ?? 0))
</script>

<template>
  <div>
    <div>
      <h1 class="font-sans text-2xl font-semibold tracking-tight text-zinc-900">
        Porudžbine
      </h1>
      <p class="mt-1 text-sm text-zinc-500">
        Sve porudžbine iz prodavnice, najnovije prve. Plaćanje pouzećem.
      </p>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <div class="inline-flex max-w-full overflow-x-auto rounded-md border border-zinc-200 bg-white p-0.5 text-sm" role="tablist" aria-label="Filter po statusu">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="status === tab.id"
          class="shrink-0 rounded px-3 py-1.5 font-medium whitespace-nowrap"
          :class="status === tab.id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'"
          @click="setQuery({ status: tab.id, page: 1 })"
        >
          {{ tab.label }}
          <span class="ml-1 text-xs" :class="status === tab.id ? 'text-white/70' : 'text-zinc-400'">{{ data?.counts[tab.id || 'all'] ?? 0 }}</span>
        </button>
      </div>
      <div class="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Icon name="lucide:search" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Broj, ime, email ili telefon…"
          aria-label="Pretraži porudžbine"
          class="w-full rounded-md border border-zinc-300 bg-white py-2 pr-3 pl-9 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
        >
      </div>
    </div>

    <p v-if="error" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ apiError(error).message || 'Porudžbine nisu učitane.' }}
    </p>

    <div class="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div v-if="fetchStatus === 'pending' && !data" class="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Icon name="lucide:loader-circle" class="size-4 animate-spin" />
        Učitavanje…
      </div>

      <div v-else-if="!data?.orders.length" class="py-16 text-center">
        <Icon name="lucide:shopping-bag" class="mx-auto size-8 text-zinc-300" />
        <p class="mt-2 text-sm text-zinc-500">
          {{ q || status ? 'Nema porudžbina za ovaj filter.' : 'Još nema porudžbina.' }}
        </p>
      </div>

      <table v-else class="w-full text-left text-sm" :class="{ 'opacity-60': fetchStatus === 'pending' }">
        <thead class="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
          <tr>
            <th scope="col" class="px-4 py-2.5">
              Porudžbina
            </th>
            <th scope="col" class="hidden px-4 py-2.5 md:table-cell">
              Kupac
            </th>
            <th scope="col" class="px-4 py-2.5">
              Status
            </th>
            <th scope="col" class="hidden px-4 py-2.5 lg:table-cell">
              Datum
            </th>
            <th scope="col" class="px-4 py-2.5 text-right">
              Ukupno
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="order in data.orders" :key="order.id" class="relative hover:bg-zinc-50">
            <td class="px-4 py-3">
              <!-- the link covers the whole row -->
              <NuxtLink :to="`/admin/porudzbine/${order.id}`" class="font-medium text-zinc-900 after:absolute after:inset-0 hover:underline">
                {{ order.orderNumber }}
              </NuxtLink>
              <span class="block text-xs text-zinc-500 md:hidden">{{ order.customer }}</span>
            </td>
            <td class="hidden px-4 py-3 md:table-cell">
              <span class="block text-zinc-900">{{ order.customer }}</span>
              <span class="block text-xs text-zinc-500">{{ order.city }} · {{ order.itemCount }} kom.</span>
            </td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap" :class="adminOrderStatusClass[order.status]">
                {{ orderStatuses[order.status].label }}
              </span>
            </td>
            <td class="hidden px-4 py-3 whitespace-nowrap text-zinc-600 lg:table-cell">
              {{ formatAdminDateTime(order.placedAt) }}
            </td>
            <td class="px-4 py-3 text-right font-medium whitespace-nowrap text-zinc-900">
              {{ order.total }},00 <span class="text-xs font-normal text-zinc-500">RSD</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="data && data.total > data.pageSize" class="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-600">
      <span>{{ from }}–{{ to }} od {{ data.total }}</span>
      <div class="flex gap-2">
        <button
          type="button"
          :disabled="page <= 1"
          class="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium hover:bg-zinc-50 disabled:opacity-40"
          @click="setQuery({ page: page - 1 })"
        >
          <Icon name="lucide:chevron-left" class="size-4" />
          Prethodna
        </button>
        <button
          type="button"
          :disabled="page >= pages"
          class="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium hover:bg-zinc-50 disabled:opacity-40"
          @click="setQuery({ page: page + 1 })"
        >
          Sledeća
          <Icon name="lucide:chevron-right" class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>
