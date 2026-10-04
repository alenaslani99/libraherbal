<script setup lang="ts">
import { categoryBySlug } from '~/data/categories'

const category = categoryBySlug('caj')!
useCategorySeo(category)
</script>

<template>
  <div>
    <ProductsHero :hero="category.hero" />
    <ProductsCatalog category="caj" />
    <CategoryIntro v-bind="category.intro" />
    <NewsletterSection />
  </div>
</template>
