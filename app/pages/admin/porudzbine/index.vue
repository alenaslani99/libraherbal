<script setup lang="ts">
import type { AdminOrderList, OrderStatus } from '#shared/types/order'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Porudžbine' })

const { status, q, page, search, setQuery } = useAdminListQuery()

const { data, status: fetchStatus, error } = await useFetch<AdminOrderList>('/api/admin/orders', {
  key: 'admin-orders',
  query: { status, q, page },
})

const STATUS_TABS: (OrderStatus | '')[] = ['', 'received', 'preparing', 'in_transit', 'delivered', 'cancelled']
const tabs = computed(() => STATUS_TABS.map(id => ({
  id,
  label: id ? orderStatuses[id].label : 'Sve',
  count: data.value?.counts[id || 'all'] ?? 0,
})))

const statusModel = computed({
  get: () => status.value,
  set: value => setQuery({ status: value, page: 1 }),
})
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

    <AdminListToolbar
      v-model:status="statusModel"
      v-model:search="search"
      :tabs="tabs"
      placeholder="Broj, ime, email ili telefon…"
      label="Pretraži porudžbine"
      class="mt-6"
    />

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

    <AdminPagination v-if="data" :page="page" :page-size="data.pageSize" :total="data.total" @change="p => setQuery({ page: p })" />
  </div>
</template>
