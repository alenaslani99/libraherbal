<script setup lang="ts">
import type { CatalogFilters, Product } from '#shared/types/product'

const { type, purpose, sort, query, resetFilters } = useProductFilters()

const [{ data: products }, { data: filters }] = await Promise.all([
  useFetch<Product[]>('/api/products', { query, default: () => [] }),
  useFetch<CatalogFilters>('/api/filters', { default: () => ({ types: [], purposes: [] }) }),
])
</script>

<!--
  Figma "Products" section: bg Accent Pale Beige, padding 72.
  "Main" row (1229 hug, gap 40): Sidebar 210 + Products column 979 (vertical, gap 56: toolbar, grid).
-->
<template>
  <section class="bg-pale-beige">
    <div class="mx-auto flex max-w-[1373px] flex-col gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:gap-10 lg:px-[72px] lg:py-[72px]">
      <ProductFilters v-model:type="type" v-model:purpose="purpose" :types="filters.types" :purposes="filters.purposes" />

      <div class="flex min-w-0 flex-1 flex-col gap-8 lg:gap-14">
        <ProductsToolbar v-model:sort="sort" :count="products.length" />
        <ProductGrid :products="products" @reset="resetFilters" />
      </div>
    </div>
  </section>
</template>
