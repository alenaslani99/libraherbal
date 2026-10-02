<script setup lang="ts">
import { shopProducts } from '~/data/products-mock'

const { type, purpose, sort, results, resetFilters } = useProductFilters(shopProducts)
</script>

<!--
  Figma "Products" section: bg Accent Pale Beige, padding 72.
  "Main" row (1229 hug, gap 40): Sidebar 210 + Products column 979 (vertical, gap 56: toolbar, grid).
-->
<template>
  <section class="bg-pale-beige">
    <div class="mx-auto flex max-w-[1373px] flex-col gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:gap-10 lg:px-[72px] lg:py-[72px]">
      <ProductFilters v-model:type="type" v-model:purpose="purpose" />

      <div class="flex min-w-0 flex-1 flex-col gap-8 lg:gap-14">
        <ProductsToolbar v-model:sort="sort" :count="results.length" />
        <ProductGrid :products="results" @reset="resetFilters" />
      </div>
    </div>
  </section>
</template>
