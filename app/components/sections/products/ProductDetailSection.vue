<script setup lang="ts">
import type { ProductDetail } from '#shared/types/product'

defineProps<{ product: ProductDetail }>()
defineEmits<{ add: [payload: { variantId: number, quantity: number }] }>()
</script>

<!--
  Figma "Main Section": fill 1440, bg Accent Pale Beige, padding-top 24.
  Two columns: gallery (thumbs + 440 image) left, buy box (~516) right.
-->
<template>
  <section class="bg-pale-beige">
    <div class="mx-auto grid max-w-[1440px] gap-10 px-4 pt-6 pb-14 sm:px-6 lg:grid-cols-[minmax(0,538px)_minmax(0,516px)] lg:items-start lg:justify-between lg:gap-12 lg:px-16 lg:pt-[72px] lg:pb-16 xl:px-24">
      <ProductGallery :images="product.images" />

      <div class="lg:pt-2">
        <ProductSummary :product="product" />
        <ProductPurchase
          :key="product.id"
          :variants="product.variants"
          :default-variant-id="product.defaultVariantId"
          class="mt-10"
          @add="$emit('add', $event)"
        />
        <div class="mt-12">
          <AccordionItem v-for="(section, i) in product.info" :key="section.title" :title="section.title" :open="i === 0">
            {{ section.body }}
          </AccordionItem>
        </div>
      </div>
    </div>
  </section>
</template>
