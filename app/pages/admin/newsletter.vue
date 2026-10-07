<script setup lang="ts">
import type { AdminSubscriber } from '#shared/types/engagement'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Newsletter' })

const { data: subscribers, status, refresh } = await useFetch<AdminSubscriber[]>('/api/admin/newsletter', {
  key: 'admin-newsletter',
  default: () => [],
})

type Filter = 'subscribed' | 'unsubscribed' | 'all'
const filter = ref<Filter>('subscribed')
const search = ref('')
const tests: Record<Filter, (s: AdminSubscriber) => boolean> = {
  subscribed: s => s.status === 'subscribed',
  unsubscribed: s => s.status === 'unsubscribed',
  all: () => true,
}
const tabs = computed(() => ([
  { id: 'subscribed', label: 'Prijavljeni' },
  { id: 'unsubscribed', label: 'Odjavljeni' },
  { id: 'all', label: 'Svi' },
] as const).map(t => ({ ...t, count: subscribers.value.filter(tests[t.id]).length })))
const filterModel = computed({
  get: () => filter.value as string,
  set: (value: string) => (filter.value = value as Filter),
})

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return subscribers.value.filter(s => tests[filter.value](s) && (!q || s.email.includes(q)))
})
const { page, pageSize, items: pageItems } = usePagedList(visible, { resetOn: [filter, search] })

const SOURCES: Record<AdminSubscriber['source'], string> = {
  footer: 'Footer',
  section: 'Newsletter sekcija',
  register: 'Registracija',
}

const busy = ref<number | null>(null)
const notice = ref('')
async function remove(subscriber: AdminSubscriber) {
  if (!window.confirm(`Trajno obrisati ${subscriber.email} sa liste?`)) return
  notice.value = ''
  busy.value = subscriber.id
  try {
    await $fetch<unknown>(`/api/admin/newsletter/${subscriber.id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (error) {
    notice.value = apiError(error).message
  }
  finally {
    busy.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-zinc-900">
          Newsletter
        </h1>
        <p class="mt-1 text-sm text-zinc-500">
          Adrese sa newsletter formi i iz registracije. Slanje mejlova (Resend) dolazi kasnije.
        </p>
      </div>
      <a
        href="/api/admin/newsletter/export"
        download
        class="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        :class="{ 'pointer-events-none opacity-40': !tabs[0]!.count }"
      >
        <Icon name="lucide:download" class="size-4" />
        Izvezi CSV
      </a>
    </div>

    <AdminListToolbar
      v-model:status="filterModel"
      v-model:search="search"
      :tabs="tabs"
      placeholder="Pretraži email…"
      label="Pretraži adrese"
      class="mt-6"
    />

    <p v-if="notice" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ notice }}
    </p>

    <div class="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div v-if="status === 'pending' && !subscribers.length" class="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Icon name="lucide:loader-circle" class="size-4 animate-spin" />
        Učitavanje…
      </div>
      <div v-else-if="!visible.length" class="py-16 text-center">
        <Icon name="lucide:send" class="mx-auto size-8 text-zinc-300" />
        <p class="mt-2 text-sm text-zinc-500">
          {{ subscribers.length ? 'Nema adresa za ovaj filter.' : 'Još niko nije prijavljen.' }}
        </p>
      </div>
      <table v-else class="w-full text-left text-sm">
        <thead class="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
          <tr>
            <th scope="col" class="w-full px-4 py-2.5 sm:w-1/2">
              Email
            </th>
            <th scope="col" class="hidden px-4 py-2.5 sm:table-cell">
              Izvor
            </th>
            <th scope="col" class="hidden px-4 py-2.5 md:table-cell">
              Prijavljen
            </th>
            <th scope="col" class="px-4 py-2.5">
              <span class="sr-only">Akcije</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="s in pageItems" :key="s.id" class="hover:bg-zinc-50">
            <td class="max-w-0 px-4 py-2.5">
              <a :href="`mailto:${s.email}`" class="block truncate text-zinc-900 hover:underline">{{ s.email }}</a>
              <span v-if="s.status === 'unsubscribed'" class="text-xs text-zinc-500">odjavljen</span>
            </td>
            <td class="hidden px-4 py-2.5 text-zinc-600 sm:table-cell">
              {{ SOURCES[s.source] }}
            </td>
            <td class="hidden px-4 py-2.5 whitespace-nowrap text-zinc-500 md:table-cell">
              {{ formatAdminDateTime(s.createdAt) }}
            </td>
            <td class="px-4 py-2.5 text-right">
              <button
                type="button"
                :disabled="busy === s.id"
                class="rounded-md p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                title="Obriši"
                :aria-label="`Obriši ${s.email}`"
                @click="remove(s)"
              >
                <Icon name="lucide:trash-2" class="size-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminPagination :page="page" :page-size="pageSize" :total="visible.length" @change="p => (page = p)" />
  </div>
</template>
