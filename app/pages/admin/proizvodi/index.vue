<script setup lang="ts">
import type { AdminProductListItem } from '#shared/types/product'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Proizvodi' })

const { data: products, status, refresh } = await useFetch<AdminProductListItem[]>('/api/admin/products', {
  key: 'admin-products',
  default: () => [],
})

// what keeps a product from selling properly
function problems(p: AdminProductListItem) {
  return [
    ...(p.price === null ? ['nema cenu'] : []),
    ...(!p.image ? ['nema sliku'] : []),
    ...(p.stock === 0 ? ['nema na stanju'] : []),
  ]
}

type Filter = 'all' | 'active' | 'hidden' | 'problems'
const filter = ref<Filter>('all')
const search = ref('')
const category = ref('')

const tests: Record<Filter, (p: AdminProductListItem) => boolean> = {
  all: () => true,
  active: p => p.isActive,
  hidden: p => !p.isActive,
  problems: p => p.isActive && problems(p).length > 0,
}
const tabs = computed(() => ([
  { id: 'all', label: 'Svi' },
  { id: 'active', label: 'Prikazani' },
  { id: 'hidden', label: 'Skriveni' },
  { id: 'problems', label: 'Za proveru' },
] as const).map(t => ({ ...t, count: products.value.filter(tests[t.id]).length })))

const filterModel = computed({
  get: () => filter.value as string,
  set: (value: string) => (filter.value = value as Filter),
})

const categoryOptions = computed(() => [
  { value: '', label: 'Sve kategorije' },
  ...[...new Set(products.value.map(p => p.category))].map(c => ({ value: c, label: c })),
])

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return products.value.filter(p =>
    tests[filter.value](p)
    && (!category.value || p.category === category.value)
    && (!q || p.name.toLowerCase().includes(q) || p.slug.includes(q)))
})

const { page, pageSize, items: pageItems } = usePagedList(visible, { resetOn: [filter, search, category] })

const busy = ref<number | null>(null)
const notice = ref('')

async function toggleActive(product: AdminProductListItem) {
  notice.value = ''
  busy.value = product.id
  try {
    await $fetch<unknown>(`/api/admin/products/${product.id}`, { method: 'PATCH', body: { isActive: !product.isActive } })
    product.isActive = !product.isActive
    refreshNuxtData('admin-product-options')
  }
  catch (error) {
    notice.value = apiError(error).message
    await refresh()
  }
  finally {
    busy.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-sans text-2xl font-semibold tracking-tight text-zinc-900">
          Proizvodi
        </h1>
        <p class="mt-1 text-sm text-zinc-500">
          Katalog prodavnice. Skriveni proizvodi nemaju stranicu i ne mogu da se poruče.
        </p>
      </div>
      <NuxtLink to="/admin/proizvodi/novi" class="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800">
        <Icon name="lucide:plus" class="size-4" />
        Novi proizvod
      </NuxtLink>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <AdminListToolbar
        v-model:status="filterModel"
        v-model:search="search"
        :tabs="tabs"
        placeholder="Pretraži po nazivu…"
        label="Pretraži proizvode"
        class="flex-1"
      />
      <AdminSelect v-model="category" :options="categoryOptions" label="Kategorija" class="w-44" />
    </div>

    <p v-if="notice" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ notice }}
    </p>

    <div class="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div v-if="status === 'pending' && !products.length" class="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Icon name="lucide:loader-circle" class="size-4 animate-spin" />
        Učitavanje…
      </div>

      <div v-else-if="!visible.length" class="py-16 text-center">
        <Icon name="lucide:package" class="mx-auto size-8 text-zinc-300" />
        <p class="mt-2 text-sm text-zinc-500">
          {{ products.length ? 'Nema proizvoda za ovaj filter.' : 'Još nema proizvoda.' }}
        </p>
        <NuxtLink v-if="!products.length" to="/admin/proizvodi/novi" class="mt-3 inline-block text-sm font-medium text-zinc-900 underline underline-offset-2">
          Dodajte prvi proizvod
        </NuxtLink>
      </div>

      <table v-else class="w-full text-left text-sm">
        <thead class="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
          <tr>
            <th scope="col" class="px-4 py-2.5">
              Proizvod
            </th>
            <th scope="col" class="px-4 py-2.5 text-right">
              Cena
            </th>
            <th scope="col" class="hidden px-4 py-2.5 text-right sm:table-cell">
              Zalihe
            </th>
            <th scope="col" class="hidden px-4 py-2.5 text-right lg:table-cell">
              Prodato
            </th>
            <th scope="col" class="hidden px-4 py-2.5 md:table-cell">
              Prikazan
            </th>
            <th scope="col" class="px-4 py-2.5">
              <span class="sr-only">Akcije</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="p in pageItems" :key="p.id" class="hover:bg-zinc-50" :class="{ 'text-zinc-400': !p.isActive }">
            <td class="max-w-0 px-4 py-2.5">
              <div class="flex items-center gap-3">
                <div class="size-11 shrink-0 overflow-hidden rounded-md bg-zinc-100" :class="{ 'opacity-50': !p.isActive }">
                  <img v-if="p.image" :src="p.image" alt="" class="size-full object-cover" loading="lazy" referrerpolicy="no-referrer">
                  <Icon v-else name="lucide:image-off" class="m-3 size-5 text-zinc-300" />
                </div>
                <div class="min-w-0">
                  <NuxtLink :to="`/admin/proizvodi/${p.id}`" class="flex items-center gap-1.5 font-medium hover:underline" :class="p.isActive ? 'text-zinc-900' : 'text-zinc-500'">
                    <span class="truncate">{{ p.name }}</span>
                    <Icon v-if="p.popular" name="lucide:star" class="size-3.5 shrink-0 text-amber-500" aria-label="Popularni artikli" />
                  </NuxtLink>
                  <span class="block truncate text-xs text-zinc-500">
                    {{ p.category }}<template v-if="p.weight"> · {{ p.weight }}</template>
                    <template v-if="!p.isActive"> · <span class="text-zinc-600">skriven</span></template>
                  </span>
                  <span v-if="p.isActive && problems(p).length" class="mt-0.5 flex items-center gap-1 text-xs text-amber-600">
                    <Icon name="lucide:triangle-alert" class="size-3 shrink-0" />
                    {{ problems(p).join(', ') }}
                  </span>
                </div>
              </div>
            </td>
            <td class="px-4 py-2.5 text-right whitespace-nowrap">
              <template v-if="p.price !== null">
                <span v-if="p.salePrice !== null" class="block font-medium text-red-600">{{ p.salePrice }},00</span>
                <span :class="p.salePrice !== null ? 'text-xs text-zinc-400 line-through' : 'font-medium'">{{ p.price }},00</span>
              </template>
              <span v-else class="text-zinc-400">—</span>
            </td>
            <td class="hidden px-4 py-2.5 text-right tabular-nums sm:table-cell" :class="p.stock === 0 ? 'font-medium text-red-600' : ''">
              {{ p.stock }}
            </td>
            <td class="hidden px-4 py-2.5 text-right text-zinc-600 tabular-nums lg:table-cell">
              {{ p.unitsSold }}
            </td>
            <td class="hidden px-4 py-2.5 md:table-cell">
              <button
                type="button"
                role="switch"
                :aria-checked="p.isActive"
                :aria-label="`${p.isActive ? 'Sakrij' : 'Prikaži'} ${p.name}`"
                :disabled="busy === p.id"
                class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50"
                :class="p.isActive ? 'bg-emerald-500' : 'bg-zinc-300'"
                @click="toggleActive(p)"
              >
                <span class="inline-block size-4 rounded-full bg-white shadow transition-transform" :class="p.isActive ? 'translate-x-4.5' : 'translate-x-0.5'" />
              </button>
            </td>
            <td class="px-4 py-2.5">
              <div class="flex items-center justify-end gap-1">
                <a
                  v-if="p.isActive"
                  :href="`/proizvodi/${p.slug}`"
                  target="_blank"
                  class="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  title="Otvori na sajtu"
                  aria-label="Otvori na sajtu"
                >
                  <Icon name="lucide:external-link" class="size-4" />
                </a>
                <NuxtLink :to="`/admin/proizvodi/${p.id}`" class="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" title="Uredi" aria-label="Uredi">
                  <Icon name="lucide:pencil" class="size-4" />
                </NuxtLink>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminPagination :page="page" :page-size="pageSize" :total="visible.length" @change="p => (page = p)" />
  </div>
</template>
