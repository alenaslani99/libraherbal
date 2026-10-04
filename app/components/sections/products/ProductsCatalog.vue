<script setup lang="ts">
import type { CatalogFilters, ProductPage } from '#shared/types/product'

// DB category slug on /med, /cajevi, /melemi; omitted on /proizvodi (all products)
const props = defineProps<{ category?: string }>()

const { type, purpose, sort, page, query, resetFilters } = useProductFilters(props.category)

const [{ data: products }, { data: filters }] = await Promise.all([
  useFetch<ProductPage>('/api/products', { query, default: () => ({ items: [], total: 0, page: 1, pageCount: 1 }) }),
  useFetch<CatalogFilters>('/api/filters', { default: () => ({ types: [], purposes: [] }) }),
])

// an old link past the last page (products were removed) → show the last page instead
watch(products, (value) => {
  if (import.meta.client && page.value > value.pageCount) page.value = value.pageCount
}, { immediate: true })

// when the page changes, bring the top of the list into view (not the hero above it)
const listTop = useTemplateRef('listTop')
watch(page, () => {
  if (import.meta.client) listTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
})
</script>

<!--
  Figma "Products" section: bg Accent Pale Beige, padding 72.
  "Main" row (1229 hug, gap 40): Sidebar 210 + Products column 979 (vertical, gap 56: toolbar, grid, pager).
-->
<template>
  <section class="bg-pale-beige">
    <div class="mx-auto flex max-w-[1373px] flex-col gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:gap-10 lg:px-[72px] lg:py-[72px]">
      <ProductFilters v-model:purpose="purpose" :type="type" :types="filters.types" :purposes="filters.purposes" />

      <div ref="listTop" class="flex min-w-0 flex-1 scroll-mt-24 flex-col gap-8 lg:gap-14">
        <ProductsToolbar v-model:sort="sort" :count="products.total" />
        <ProductGrid :products="products.items" @reset="resetFilters" />
        <ProductPagination :page="page" :page-count="products.pageCount" />
      </div>
    </div>
  </section>
</template>
