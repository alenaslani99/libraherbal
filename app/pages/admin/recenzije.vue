<script setup lang="ts">
import type { AdminReview } from '#shared/types/engagement'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Recenzije' })

const { data: reviews, status, refresh } = await useFetch<AdminReview[]>('/api/admin/reviews', {
  key: 'admin-reviews',
  default: () => [],
})

type Filter = 'pending' | 'approved' | 'all'
const filter = ref<Filter>('pending')
const search = ref('')
const tests: Record<Filter, (r: AdminReview) => boolean> = {
  pending: r => !r.approved,
  approved: r => r.approved,
  all: () => true,
}
const tabs = computed(() => ([
  { id: 'pending', label: 'Na čekanju' },
  { id: 'approved', label: 'Objavljene' },
  { id: 'all', label: 'Sve' },
] as const).map(t => ({ ...t, count: reviews.value.filter(tests[t.id]).length })))
const filterModel = computed({
  get: () => filter.value as string,
  set: (value: string) => (filter.value = value as Filter),
})

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return reviews.value.filter(r => tests[filter.value](r) && (!q
    || r.productName.toLowerCase().includes(q)
    || r.userName.toLowerCase().includes(q)
    || r.userEmail.toLowerCase().includes(q)
    || r.comment.toLowerCase().includes(q)))
})
const { page, pageSize, items: pageItems } = usePagedList(visible, { resetOn: [filter, search] })

const busy = ref<number | null>(null)
const notice = ref('')

async function run(review: AdminReview, action: () => Promise<unknown>) {
  notice.value = ''
  busy.value = review.id
  try {
    await action()
    await Promise.all([refresh(), refreshNuxtData('admin-dashboard')])
  }
  catch (error) {
    notice.value = apiError(error).message
  }
  finally {
    busy.value = null
  }
}
const setApproved = (review: AdminReview, approved: boolean) =>
  run(review, () => $fetch<unknown>(`/api/admin/reviews/${review.id}`, { method: 'PATCH', body: { approved } }))
function remove(review: AdminReview) {
  if (!window.confirm(`Obrisati recenziju od „${review.userName}" za ${review.productName}? Ovo ne može da se poništi.`)) return
  return run(review, () => $fetch<unknown>(`/api/admin/reviews/${review.id}`, { method: 'DELETE' }))
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold tracking-tight text-zinc-900">
      Recenzije
    </h1>
    <p class="mt-1 text-sm text-zinc-500">
      Kupci pišu recenzije na stranici proizvoda. Na sajtu se prikazuju tek kada ih objavite; izmenjena recenzija ponovo čeka odobrenje.
    </p>

    <AdminListToolbar
      v-model:status="filterModel"
      v-model:search="search"
      :tabs="tabs"
      placeholder="Proizvod, kupac ili tekst…"
      label="Pretraži recenzije"
      class="mt-6"
    />

    <p v-if="notice" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ notice }}
    </p>

    <div class="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div v-if="status === 'pending' && !reviews.length" class="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Icon name="lucide:loader-circle" class="size-4 animate-spin" />
        Učitavanje…
      </div>
      <div v-else-if="!visible.length" class="py-16 text-center">
        <Icon name="lucide:star" class="mx-auto size-8 text-zinc-300" />
        <p class="mt-2 text-sm text-zinc-500">
          {{ filter === 'pending' && !search ? 'Nema recenzija koje čekaju odobrenje.' : 'Nema recenzija za ovaj filter.' }}
        </p>
      </div>

      <ul v-else class="divide-y divide-zinc-100">
        <li v-for="r in pageItems" :key="r.id" class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="flex gap-0.5" role="img" :aria-label="`Ocena ${r.rating} od 5`">
                <Icon v-for="n in 5" :key="n" name="lucide:star" class="size-3.5 *:fill-current" :class="n <= r.rating ? 'text-amber-400' : 'text-zinc-200'" />
              </span>
              <NuxtLink :to="`/admin/proizvodi/${r.productId}`" class="text-sm font-medium text-zinc-900 hover:underline">
                {{ r.productName }}
              </NuxtLink>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="r.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ r.approved ? 'Objavljena' : 'Na čekanju' }}
              </span>
            </div>
            <p v-if="r.comment" class="mt-2 text-sm whitespace-pre-line text-zinc-700">
              {{ r.comment }}
            </p>
            <p v-else class="mt-2 text-sm text-zinc-400 italic">
              Bez komentara, samo ocena.
            </p>
            <p class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
              <span>{{ r.userName }} · {{ r.userEmail }}</span>
              <span v-if="r.verified" class="inline-flex items-center gap-1 text-emerald-700">
                <Icon name="lucide:badge-check" class="size-3.5" />
                kupio proizvod
              </span>
              <span>{{ formatAdminDateTime(r.updatedAt) }}<template v-if="r.updatedAt !== r.createdAt"> (izmenjena)</template></span>
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              v-if="!r.approved"
              type="button"
              :disabled="busy === r.id"
              class="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              @click="setApproved(r, true)"
            >
              <Icon :name="busy === r.id ? 'lucide:loader-circle' : 'lucide:check'" class="size-4" :class="{ 'animate-spin': busy === r.id }" />
              Objavi
            </button>
            <button
              v-else
              type="button"
              :disabled="busy === r.id"
              class="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
              @click="setApproved(r, false)"
            >
              <Icon name="lucide:eye-off" class="size-4" />
              Skloni
            </button>
            <a
              :href="`/proizvodi/${r.productSlug}#recenzije`"
              target="_blank"
              class="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              title="Otvori proizvod na sajtu"
              aria-label="Otvori proizvod na sajtu"
            >
              <Icon name="lucide:external-link" class="size-4" />
            </a>
            <button
              type="button"
              :disabled="busy === r.id"
              class="rounded-md p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              title="Obriši"
              aria-label="Obriši recenziju"
              @click="remove(r)"
            >
              <Icon name="lucide:trash-2" class="size-4" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <AdminPagination :page="page" :page-size="pageSize" :total="visible.length" @change="p => (page = p)" />
  </div>
</template>
