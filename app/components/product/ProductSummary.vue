<script setup lang="ts">
import type { ProductDetail } from '#shared/types/product'

defineProps<{
  product: Pick<ProductDetail, 'name' | 'category' | 'purpose' | 'rating' | 'reviewCount' | 'description'>
}>()

// Serbian plural: 1 recenzija, 2–4 recenzije, 5+ recenzija (11–14 → recenzija)
function reviewsLabel(n: number) {
  const last = n % 10
  const lastTwo = n % 100
  if (last === 1 && lastTwo !== 11) return `${n} recenzija`
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${n} recenzije`
  return `${n} recenzija`
}
</script>

<!-- Figma: eyebrow "MED • DISANJE", Fraunces title in Main Green, rating row, short description -->
<template>
  <div>
    <p class="text-sm uppercase leading-4 tracking-[0.08em] text-brown-200">
      {{ product.category }}<template v-if="product.purpose">
        • {{ product.purpose }}
      </template>
    </p>
    <h1 class="mt-2 text-[44px] leading-none tracking-[-0.02em] text-forest sm:text-[56px] lg:text-[64px]">
      {{ product.name }}
    </h1>
    <div class="mt-4 flex items-center gap-3">
      <RatingStars :rating="product.rating" />
      <p class="text-xs tracking-[0.04em] text-ink">
        {{ String(product.rating).replace('.', ',') }} · {{ reviewsLabel(product.reviewCount) }}
      </p>
    </div>
    <p class="mt-6 max-w-[460px] text-sm leading-5 text-ink">
      {{ product.description }}
    </p>
  </div>
</template>
