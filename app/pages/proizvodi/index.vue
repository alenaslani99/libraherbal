<script setup lang="ts">
import { categoryBySlug } from '~/data/categories'
import { productsPage } from '~/data/products-page'

// Old filter links (/proizvodi?vrsta=caj) → the category's own page, keeping the other filters
const route = useRoute()
const legacyType = typeof route.query.vrsta === 'string' ? categoryBySlug(route.query.vrsta) : undefined
if (legacyType) {
  const { vrsta: _, ...query } = route.query
  await navigateTo({ path: legacyType.path, query }, { redirectCode: 301 })
}

useCategorySeo()
</script>

<template>
  <div>
    <ProductsHero :hero="productsPage.hero" />
    <ProductsCatalog />
    <NewsletterSection />
  </div>
</template>
