<script setup lang="ts">
import type { CategoryHero } from '~/data/categories'

// /proizvodi and every category page share this hero; only the copy and photos change
defineProps<{ hero: CategoryHero }>()
</script>

<!-- Figma Hero Section (/proizvodi, /med, /cajevi, /melemi): bg Main Green, padding 72/128, space-between, two bottom-aligned images right -->
<template>
  <section class="bg-forest">
    <div class="mx-auto flex max-w-[1440px] flex-col gap-12 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-16 xl:px-32 lg:py-[72px]">
      <div class="lg:flex-1">
        <p class="text-xs uppercase leading-none text-sun">
          {{ hero.eyebrow }}
        </p>
        <h1 class="mt-4 text-[44px] font-normal leading-[1.05] tracking-[-0.02em] text-white sm:text-[56px] sm:whitespace-nowrap xl:text-[64px]">
          <span class="block">{{ hero.titleLine1 }}</span>
          <em class="block text-sun">{{ hero.titleLine2 }}</em>
        </h1>
        <p class="mt-8 max-w-[520px] text-sm font-light leading-5 text-white">
          {{ hero.text }}
        </p>
      </div>

      <!-- fluid image pair: 314 + 24 + 265 = 603px at full size -->
      <div class="flex w-full max-w-[603px] shrink-0 items-end gap-3 sm:gap-6 lg:w-[52%]">
        <NuxtImg
          :src="hero.images[0]"
          :alt="`${hero.eyebrow} — Libra Herbal`"
          width="314"
          height="392"
          format="webp"
          sizes="xs:55vw sm:55vw md:320px lg:320px"
          preload
          fetchpriority="high"
          class="aspect-[314/392] min-w-0 flex-[314] rounded-xl object-cover"
        />
        <NuxtImg
          :src="hero.images[1]"
          :alt="`${hero.titleLine1} ${hero.titleLine2}`"
          width="265"
          height="353"
          format="webp"
          sizes="xs:45vw sm:45vw md:270px lg:270px"
          class="aspect-[265/353] min-w-0 flex-[265] rounded-xl object-cover"
        />
      </div>
    </div>
  </section>
</template>
