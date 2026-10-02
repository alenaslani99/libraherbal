<script setup lang="ts">
import type { ProductImage } from '#shared/types/product'

const props = defineProps<{ images: ProductImage[] }>()

const active = ref(0)
const current = computed(() => props.images[active.value] ?? props.images[0])
</script>

<!--
  Figma: thumbnail column (74px squares, 16px apart) + 24px gap + 440px square main image, radius 24.
  Below lg the thumbnails move under the main image as a row.
-->
<template>
  <div class="flex flex-col-reverse gap-4 lg:flex-row lg:items-start lg:gap-6">
    <div v-if="images.length > 1" class="flex gap-3 lg:flex-col lg:gap-4" role="group" aria-label="Slike proizvoda">
      <button
        v-for="(image, i) in images"
        :key="image.src + i"
        type="button"
        class="size-[74px] shrink-0 overflow-hidden rounded-xl ring-offset-2 ring-offset-pale-beige transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun"
        :class="i === active ? 'ring-2 ring-forest' : 'opacity-80 hover:opacity-100'"
        :aria-label="`Prikaži sliku ${i + 1} od ${images.length}`"
        :aria-current="i === active"
        @click="active = i"
      >
        <NuxtImg :src="image.src" alt="" width="74" height="74" format="webp" sizes="xs:74px sm:74px md:74px lg:74px" class="size-full object-cover" />
      </button>
    </div>

    <NuxtImg
      v-if="current"
      :key="current.src"
      :src="current.src"
      :alt="current.alt"
      width="440"
      height="440"
      format="webp"
      sizes="xs:100vw sm:100vw md:440px lg:440px"
      preload
      fetchpriority="high"
      class="aspect-square w-full min-w-0 rounded-3xl object-cover lg:max-w-[440px]"
    />
  </div>
</template>
