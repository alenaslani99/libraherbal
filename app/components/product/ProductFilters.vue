<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { FilterOption } from '#shared/types/product'
import { categoryBySlug } from '~/data/categories'
import { ALL, PAGE_KEY } from '~/composables/useProductFilters'

const props = defineProps<{
  // current type: a category slug on /med, /cajevi, /melemi, ALL on /proizvodi
  type: string
  types: FilterOption[]
  purposes: FilterOption[]
}>()

const purpose = defineModel<string>('purpose', { required: true })

// Each type has its own page; the links keep the purpose filter and sort, and start again from page 1
const route = useRoute()
const typeLinks = computed(() => {
  const query = { ...route.query, [PAGE_KEY]: undefined }
  const links: Record<string, RouteLocationRaw> = { [ALL]: { path: '/proizvodi', query } }
  for (const option of props.types) {
    const page = categoryBySlug(option.value)
    if (page) links[option.value] = { path: page.path, query }
  }
  return links
})

// below lg the filters fold behind the "Filteri" toggle
const open = ref(false)
const panelId = useId()
</script>

<!--
  Figma "Sidebar": 210 wide, padding-top 8, horizontal: filters column, gap 56, 1px vertical rule.
  Below lg it becomes a full-width collapsible panel above the grid.
-->
<template>
  <aside class="lg:flex lg:w-[210px] lg:shrink-0 lg:gap-14 lg:pt-2" aria-label="Filteri">
    <div class="lg:flex-1">
      <button
        type="button"
        class="flex items-center gap-2 text-sm font-semibold text-ink lg:pointer-events-none"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click="open = !open"
      >
        <Icon name="lucide:sliders-horizontal" class="size-4" />
        Filteri
        <Icon name="lucide:chevron-down" class="size-4 transition-transform duration-200 lg:hidden" :class="{ 'rotate-180': open }" />
      </button>

      <div :id="panelId" class="mt-6 lg:mt-10 lg:block" :class="open ? 'block' : 'hidden'">
        <div class="grid grid-cols-2 gap-8 sm:flex sm:gap-16 lg:flex-col lg:gap-0">
          <FilterGroup :model-value="type" title="Vrsta proizvoda" name="vrsta" :options="types" :links="typeLinks" />
          <hr class="hidden border-line lg:my-8 lg:block">
          <FilterGroup v-model="purpose" title="Svrha" name="svrha" :options="purposes" />
        </div>
      </div>
    </div>

    <div class="hidden w-px self-stretch bg-line lg:block" />
  </aside>
</template>
