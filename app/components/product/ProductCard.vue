<script setup lang="ts">
import type { Product } from '#shared/types/product'

const props = defineProps<{ product: Product }>()

const cart = useCart()

function addToCart() {
  const { id, slug, name, weight, price, image } = props.product
  cart.add({ productId: id, slug, name, weight, price, image })
}
</script>

<!--
  Figma "Product Card": 275 × 350 (fluid: width comes from the grid, 275px at 1440), radius 16, padding 8/8/16/8, gap 12, bg Main Beige #DED6C1.
  Hover: image tilts and grows slightly (smart animate, ease-out, 300ms).
-->
<template>
  <article class="group relative flex flex-col gap-3 rounded-2xl bg-main-beige px-2 pt-2 pb-4">
    <NuxtLink :to="`/proizvodi/${product.slug}`" class="block" tabindex="-1" aria-hidden="true">
      <NuxtImg
        :src="product.image"
        :alt="product.name"
        width="259"
        height="248"
        format="webp"
        sizes="xs:50vw sm:50vw md:50vw lg:25vw xl:300px"
        loading="lazy"
        class="aspect-[259/248] w-full rounded-2xl object-cover transition-transform duration-300 ease-out group-hover:-rotate-3 group-hover:scale-[1.04]"
      />
    </NuxtLink>

    <div class="flex flex-1 flex-col px-2">
      <p class="text-[10px] uppercase leading-3 text-brown-200">
        {{ product.category }} • <span class="normal-case">{{ product.weight }}</span>
      </p>
      <h3 class="mt-1 font-heading text-lg font-semibold leading-6 text-forest">
        <NuxtLink :to="`/proizvodi/${product.slug}`" class="after:absolute after:inset-0 after:rounded-2xl">
          {{ product.name }}
        </NuxtLink>
      </h3>
      <div class="mt-auto flex items-end justify-between pt-1">
        <p class="text-sm font-semibold leading-none text-ink">
          {{ product.price }},00 <span class="text-[10px]">RSD</span>
        </p>
        <AddToCartButton :product-name="product.name" @add="addToCart" />
      </div>
    </div>
  </article>
</template>
