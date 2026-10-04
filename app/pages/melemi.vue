<script setup lang="ts">
import { categoryBySlug } from '~/data/categories'

const category = categoryBySlug('melem')!
useCategorySeo(category)
</script>

<template>
  <div>
    <ProductsHero :hero="category.hero" />
    <ProductsCatalog category="melem" />
    <CategoryIntro v-bind="category.intro" />
    <NewsletterSection />
  </div>
</template>
