<script setup lang="ts">
import { PAGE_KEY } from '~/composables/useProductFilters'

const props = defineProps<{
  page: number
  pageCount: number
}>()

const route = useRoute()

// Real links (crawlable, open in a new tab, back button works): current query + ?strana; page 1 drops it
function pageLink(n: number) {
  return { query: { ...route.query, [PAGE_KEY]: n === 1 ? undefined : String(n) } }
}

// 1 … 4 5 6 … 12 — first, last and the neighbours of the current page; null = gap
const items = computed(() => {
  const { page, pageCount } = props
  const shown = [...new Set([1, page - 1, page, page + 1, pageCount])]
    .filter(n => n >= 1 && n <= pageCount)
    .sort((a, b) => a - b)

  const out: (number | null)[] = []
  for (const n of shown) {
    const prev = out.at(-1)
    if (typeof prev === 'number' && n - prev > 1) out.push(n - prev === 2 ? prev + 1 : null)
    out.push(n)
  }
  return out
})
</script>

<!-- Pager under the product grid: ‹ 1 2 … 8 › — current page is the forest pill -->
<template>
  <nav v-if="pageCount > 1" aria-label="Stranice" class="flex items-center justify-center gap-1 sm:gap-2">
    <NuxtLink
      v-if="page > 1"
      :to="pageLink(page - 1)"
      class="flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-main-beige"
      aria-label="Prethodna stranica"
    >
      <Icon name="lucide:chevron-left" class="size-5" />
    </NuxtLink>
    <span v-else class="flex size-10 items-center justify-center text-ink/30" aria-hidden="true">
      <Icon name="lucide:chevron-left" class="size-5" />
    </span>

    <template v-for="(item, i) in items" :key="item ?? `gap-${i}`">
      <span v-if="item === null" class="flex size-10 items-center justify-center text-sm text-ink" aria-hidden="true">…</span>
      <NuxtLink
        v-else
        :to="pageLink(item)"
        :aria-current="item === page ? 'page' : undefined"
        class="flex size-10 items-center justify-center rounded-full border text-sm transition-colors"
        :class="item === page ? 'border-forest bg-forest font-semibold text-white' : 'border-transparent text-ink hover:border-forest'"
      >
        <span class="sr-only">Stranica </span>{{ item }}
      </NuxtLink>
    </template>

    <NuxtLink
      v-if="page < pageCount"
      :to="pageLink(page + 1)"
      class="flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-main-beige"
      aria-label="Sledeća stranica"
    >
      <Icon name="lucide:chevron-right" class="size-5" />
    </NuxtLink>
    <span v-else class="flex size-10 items-center justify-center text-ink/30" aria-hidden="true">
      <Icon name="lucide:chevron-right" class="size-5" />
    </span>
  </nav>
</template>
