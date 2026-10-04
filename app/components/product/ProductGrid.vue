<script setup lang="ts">
import type { Product } from '#shared/types/product'

defineProps<{ products: Product[] }>()
defineEmits<{ reset: [] }>()
</script>

<!-- Figma: 4 columns × ~220px within the 979px products column, 32px gaps -->
<template>
  <div v-if="products.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 lg:gap-8">
    <ProductCard v-for="product in products" :key="product.id" :product="product" />
  </div>

  <div v-else class="flex flex-col items-center gap-4 rounded-2xl bg-main-beige/50 px-6 py-16 text-center">
    <Icon name="lucide:search-x" class="size-8 text-brown-200" />
    <p class="text-sm text-ink">
      Nema proizvoda za izabrane filtere.
    </p>
    <BaseButton variant="forest" @click="$emit('reset')">
      Poništi filtere
    </BaseButton>
  </div>
</template>
