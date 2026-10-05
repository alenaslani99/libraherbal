<script setup lang="ts">
import type { AdminBlogListItem } from '#shared/types/blog'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Blog' })

const { data: posts, status, refresh } = await useFetch<AdminBlogListItem[]>('/api/admin/blog', {
  key: 'admin-blog-list',
  default: () => [],
})

const search = ref('')
const filter = ref<'all' | 'published' | 'draft'>('all')

const counts = computed(() => ({
  all: posts.value.length,
  published: posts.value.filter(p => p.status === 'published').length,
  draft: posts.value.filter(p => p.status === 'draft').length,
}))

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return posts.value.filter(p =>
    (filter.value === 'all' || p.status === filter.value)
    && (!q || p.title.toLowerCase().includes(q) || p.slug.includes(q)))
})

const filters = [
  { id: 'all', label: 'Sve' },
  { id: 'published', label: 'Objavljene' },
  { id: 'draft', label: 'Nacrti' },
] as const

const deleting = ref<number | null>(null)
const notice = ref('')

async function remove(post: AdminBlogListItem) {
  if (!window.confirm(`Obrisati objavu „${post.title}"? Ovo ne može da se poništi.`)) return
  notice.value = ''
  deleting.value = post.id
  try {
    await $fetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (error) {
    notice.value = apiError(error).message
  }
  finally {
    deleting.value = null
  }
}

// D1 'YYYY-MM-DD HH:MM:SS' is UTC
function formatUpdated(value: string) {
  return new Date(`${value.replace(' ', 'T')}Z`).toLocaleString('sr-Latn-RS', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="font-sans text-2xl font-semibold tracking-tight text-zinc-900">
          Blog
        </h1>
        <p class="mt-1 text-sm text-zinc-500">
          Objave na stranici /blog. Nacrte vidite samo vi.
        </p>
      </div>
      <NuxtLink to="/admin/blog/nova" class="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800">
        <Icon name="lucide:plus" class="size-4" />
        Nova objava
      </NuxtLink>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <div class="inline-flex rounded-md border border-zinc-200 bg-white p-0.5 text-sm" role="tablist" aria-label="Filter po statusu">
        <button
          v-for="f in filters"
          :key="f.id"
          type="button"
          role="tab"
          :aria-selected="filter === f.id"
          class="rounded px-3 py-1.5 font-medium"
          :class="filter === f.id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'"
          @click="filter = f.id"
        >
          {{ f.label }}
          <span class="ml-1 text-xs" :class="filter === f.id ? 'text-white/70' : 'text-zinc-400'">{{ counts[f.id] }}</span>
        </button>
      </div>
      <div class="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Icon name="lucide:search" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Pretraži po naslovu…"
          aria-label="Pretraži objave"
          class="w-full rounded-md border border-zinc-300 bg-white py-2 pr-3 pl-9 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
        >
      </div>
    </div>

    <p v-if="notice" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ notice }}
    </p>

    <div class="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div v-if="status === 'pending' && !posts.length" class="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Icon name="lucide:loader-circle" class="size-4 animate-spin" />
        Učitavanje…
      </div>

      <div v-else-if="!visible.length" class="py-16 text-center">
        <Icon name="lucide:newspaper" class="mx-auto size-8 text-zinc-300" />
        <p class="mt-2 text-sm text-zinc-500">
          {{ posts.length ? 'Nema objava za ovu pretragu.' : 'Još nema objava.' }}
        </p>
        <NuxtLink v-if="!posts.length" to="/admin/blog/nova" class="mt-3 inline-block text-sm font-medium text-zinc-900 underline underline-offset-2">
          Napišite prvu objavu
        </NuxtLink>
      </div>

      <table v-else class="w-full text-left text-sm">
        <thead class="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
          <tr>
            <th scope="col" class="px-4 py-2.5">
              Naslov
            </th>
            <th scope="col" class="hidden px-4 py-2.5 sm:table-cell">
              Status
            </th>
            <th scope="col" class="hidden px-4 py-2.5 md:table-cell">
              Datum objave
            </th>
            <th scope="col" class="hidden px-4 py-2.5 lg:table-cell">
              Izmenjeno
            </th>
            <th scope="col" class="px-4 py-2.5">
              <span class="sr-only">Akcije</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="post in visible" :key="post.id" class="group hover:bg-zinc-50">
            <td class="max-w-0 px-4 py-3">
              <NuxtLink :to="`/admin/blog/${post.id}`" class="block truncate font-medium text-zinc-900 hover:underline">
                {{ post.title }}
              </NuxtLink>
              <span class="flex items-center gap-1.5 truncate text-xs text-zinc-500">
                <Icon v-if="post.featured" name="lucide:star" class="size-3 shrink-0 text-amber-500" aria-label="Istaknuta" />
                /blog/{{ post.slug }}
              </span>
            </td>
            <td class="hidden px-4 py-3 sm:table-cell">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'"
              >
                {{ post.status === 'published' ? 'Objavljeno' : 'Nacrt' }}
              </span>
            </td>
            <td class="hidden px-4 py-3 whitespace-nowrap text-zinc-600 md:table-cell">
              {{ post.publishedAt ? formatPostDate(post.publishedAt) : '—' }}
            </td>
            <td class="hidden px-4 py-3 whitespace-nowrap text-zinc-500 lg:table-cell">
              {{ formatUpdated(post.updatedAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <a
                  v-if="post.status === 'published'"
                  :href="`/blog/${post.slug}`"
                  target="_blank"
                  class="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  title="Otvori na sajtu"
                  aria-label="Otvori na sajtu"
                >
                  <Icon name="lucide:external-link" class="size-4" />
                </a>
                <NuxtLink :to="`/admin/blog/${post.id}`" class="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" title="Uredi" aria-label="Uredi">
                  <Icon name="lucide:pencil" class="size-4" />
                </NuxtLink>
                <button
                  type="button"
                  :disabled="deleting === post.id"
                  class="rounded-md p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  title="Obriši"
                  aria-label="Obriši"
                  @click="remove(post)"
                >
                  <Icon :name="deleting === post.id ? 'lucide:loader-circle' : 'lucide:trash-2'" class="size-4" :class="{ 'animate-spin': deleting === post.id }" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
