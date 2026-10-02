<script setup lang="ts">
import type { Product } from '~/data/home-mock'

withDefaults(defineProps<{
  title: string
  subtitle?: string
  products: Product[]
  buttonLabel?: string
  to?: string
}>(), {
  buttonLabel: 'Pogledaj sve proizvode',
  to: '/proizvodi',
})
</script>

<!--
  Figma "Popular Articles" (home) / "Preporučeni proizvodi" (product page):
  1440 wide, padding 72/128, gap 40, bg Accent Pale Beige; heading + button row, 4 product cards
-->
<template>
  <section v-if="products.length" class="bg-pale-beige">
    <div class="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-14 sm:px-6 lg:px-16 xl:px-32 lg:py-[72px]">
      <div class="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 class="text-[40px] leading-none tracking-[-0.02em] text-ink sm:text-[56px]">
            {{ title }}
          </h2>
          <p v-if="subtitle" class="mt-[9px] text-base font-light leading-5 text-black">
            {{ subtitle }}
          </p>
        </div>
        <BaseButton :to="to" size="lg" class="font-medium">
          {{ buttonLabel }}
          <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </BaseButton>
      </div>

      <!-- gap-7 (28px) gives exactly 275px cards at 1440 -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-7">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </div>
  </section>
</template>
