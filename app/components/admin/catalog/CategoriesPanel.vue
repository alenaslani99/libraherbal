<script setup lang="ts">
import type { AdminCategory } from '#shared/types/catalog'
import { categoryNameSchema } from '#shared/schemas/catalog'
import { categoryBySlug } from '~/data/categories'

const { data: categories, refresh } = await useFetch<AdminCategory[]>('/api/admin/catalog/categories', {
  key: 'admin-categories',
  default: () => [],
})

// name being edited per category id
const drafts = reactive<Record<number, string>>({})
watch(categories, list => list.forEach(c => (drafts[c.id] = c.name)), { immediate: true })

const { page, pageSize, items: pageItems } = usePagedList(categories)

const errors = ref<Record<number, string>>({})
const saving = ref<number | null>(null)
const savedId = ref<number | null>(null)

async function save(category: AdminCategory) {
  const result = categoryNameSchema.safeParse({ name: drafts[category.id] })
  errors.value = { ...errors.value, [category.id]: result.success ? '' : result.error.issues[0]!.message }
  if (!result.success) return

  saving.value = category.id
  try {
    await $fetch<unknown>(`/api/admin/catalog/categories/${category.id}`, { method: 'PUT', body: result.data })
    await Promise.all([refresh(), refreshNuxtData('admin-catalog-options')])
    savedId.value = category.id
    setTimeout(() => (savedId.value === category.id) && (savedId.value = null), 2000)
  }
  catch (error) {
    errors.value = { ...errors.value, [category.id]: apiError(error).message || Object.values(apiError(error).fields)[0] || 'Greška.' }
  }
  finally {
    saving.value = null
  }
}
</script>

<template>
  <div>
    <div class="flex items-start gap-2 rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
      <Icon name="lucide:info" class="mt-0.5 size-4 shrink-0 text-zinc-400" />
      <p>
        Svaka kategorija ima svoju stranicu (/med, /cajevi, /melemi) sa tekstom i slikama u kodu sajta,
        pa se ovde ne dodaju i ne brišu, a adresa se ne menja. Naziv se prikazuje na karticama proizvoda
        („MED • 370ml") i u naslovu „Šta je u medu?" iznad sastojaka.
      </p>
    </div>

    <div class="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
          <tr>
            <th scope="col" class="px-4 py-2.5">
              Naziv
            </th>
            <th scope="col" class="hidden px-4 py-2.5 sm:table-cell">
              Stranica
            </th>
            <th scope="col" class="px-4 py-2.5 text-right">
              Proizvodi
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100">
          <tr v-for="c in pageItems" :key="c.id">
            <td class="px-4 py-3">
              <form class="flex max-w-sm items-center gap-2" novalidate @submit.prevent="save(c)">
                <input
                  v-model="drafts[c.id]"
                  type="text"
                  maxlength="40"
                  :aria-label="`Naziv kategorije ${c.name}`"
                  class="min-w-0 flex-1 rounded-md border bg-white px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
                  :class="errors[c.id] ? 'border-red-500' : 'border-zinc-300'"
                >
                <button
                  v-if="drafts[c.id] !== c.name"
                  type="submit"
                  :disabled="saving === c.id"
                  class="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  Sačuvaj
                </button>
                <Icon v-else-if="savedId === c.id" name="lucide:check" class="size-4 text-emerald-600" aria-label="Sačuvano" />
              </form>
              <p v-if="errors[c.id]" class="mt-1 text-xs text-red-600">
                {{ errors[c.id] }}
              </p>
            </td>
            <td class="hidden px-4 py-3 sm:table-cell">
              <a
                v-if="categoryBySlug(c.slug)"
                :href="categoryBySlug(c.slug)!.path"
                target="_blank"
                class="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 hover:underline"
              >
                {{ categoryBySlug(c.slug)!.path }}
                <Icon name="lucide:external-link" class="size-3.5" />
              </a>
              <span v-else class="text-xs text-amber-600">nema stranicu ({{ c.slug }})</span>
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <NuxtLink to="/admin/proizvodi" class="text-zinc-900 hover:underline">
                {{ c.activeCount }}
              </NuxtLink>
              <span v-if="c.productCount > c.activeCount" class="text-xs text-zinc-500"> + {{ c.productCount - c.activeCount }} skrivenih</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminPagination :page="page" :page-size="pageSize" :total="categories.length" @change="p => (page = p)" />
  </div>
</template>
