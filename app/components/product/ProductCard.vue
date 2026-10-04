<script setup lang="ts">
import type { Product } from '#shared/types/product'

const props = defineProps<{ product: Product }>()

// "-18%" badge while the product is on promotion
const discount = computed(() => {
  const { price, regularPrice } = props.product
  return regularPrice ? Math.round((1 - price / regularPrice) * 100) : 0
})

const cart = useCart()

function addToCart() {
  const { id, slug, name, weight, price, image } = props.product
  cart.add({ productId: id, slug, name, weight, price, image })
}
</script>

<!--
  Figma "Product Card": 275 × 350 (fluid: width comes from the grid, 275px at 1440), radius 16, padding 8/8/16/8, gap 12, bg Main Beige #DED6C1.
  Hover: image tilts and grows slightly (smart animate, ease-out, 300ms).
  Promotion: yellow "-N%" pill on the image, old price struck through above the new one.
-->
<template>
  <article class="group relative flex flex-col gap-3 rounded-2xl bg-main-beige px-2 pt-2 pb-4">
    <span
      v-if="discount"
      class="pointer-events-none absolute top-4 left-4 z-10 rounded-full bg-sun px-2.5 py-1 text-[11px] font-semibold leading-none text-ink"
    >
      -{{ discount }}%<span class="sr-only"> popusta</span>
    </span>
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
        <div>
          <p v-if="product.regularPrice" class="mb-1 text-[11px] leading-none text-brown-200">
            <span class="sr-only">Stara cena: </span><del>{{ product.regularPrice }},00 RSD</del>
          </p>
          <p class="text-sm font-semibold leading-none text-ink">
            <span v-if="product.regularPrice" class="sr-only">Akcijska cena: </span>{{ product.price }},00 <span class="text-[10px]">RSD</span>
          </p>
        </div>
        <AddToCartButton :product-name="product.name" @add="addToCart" />
      </div>
    </div>
  </article>
</template>
