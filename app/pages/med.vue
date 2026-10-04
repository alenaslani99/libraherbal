<script setup lang="ts">
import { categoryBySlug } from '~/data/categories'

const category = categoryBySlug('med')!
useCategorySeo(category)
</script>

<template>
  <div>
    <ProductsHero :hero="category.hero" />
    <ProductsCatalog category="med" />
    <CategoryIntro v-bind="category.intro" />
    <NewsletterSection />
  </div>
</template>
