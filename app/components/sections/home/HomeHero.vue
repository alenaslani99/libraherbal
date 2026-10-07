<script setup lang="ts">
import type { Hero } from '#shared/types/site'

// written in /admin/pocetna (which also renders this as its live preview)
const props = defineProps<{ hero: Hero }>()

const ratingText = computed(() => props.hero.rating?.toFixed(1).replace('.', ','))
const filledStars = computed(() => Math.round(props.hero.rating ?? 0))
</script>

<template>
  <section class="relative isolate overflow-hidden bg-forest-dark">
    <!-- site paths go through the image optimizer; external URLs are shown as they are (see BlogImage) -->
    <NuxtImg
      v-if="hero.image.startsWith('/')"
      :src="hero.image"
      :alt="hero.imageAlt"
      width="1536"
      height="1024"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
      format="webp"
      preload
      fetchpriority="high"
      class="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]"
    />
    <img
      v-else
      :src="hero.image"
      :alt="hero.imageAlt"
      width="1536"
      height="1024"
      fetchpriority="high"
      referrerpolicy="no-referrer"
      class="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]"
    >
    <!-- Figma: two linear gradients — black from the left (text contrast), main green from the bottom (blends into Specs Bar) -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
    <div class="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-forest/70 to-transparent" />
    <!-- below lg the text sits over the jar, so darken the whole photo a bit -->
    <div class="absolute inset-0 -z-10 bg-black/35 lg:hidden" />

    <div class="mx-auto flex min-h-[560px] max-w-[1440px] items-center px-4 py-16 sm:py-20 sm:px-6 lg:min-h-[660px] lg:px-16 xl:px-32">
      <div class="w-full sm:w-auto">
        <h1 class="text-[44px] leading-none tracking-[-0.02em] text-white sm:text-[60px] sm:whitespace-nowrap lg:text-[72px]">
          <span class="block">{{ hero.titleLine1 }}</span>
          <em v-if="hero.titleLine2" class="block text-sun">{{ hero.titleLine2 }}</em>
        </h1>
        <p v-if="hero.subtitle" class="mt-7 max-w-[354px] text-base font-light leading-[18px] text-white">
          {{ hero.subtitle }}
        </p>

        <div class="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row lg:mt-16">
          <BaseButton :to="hero.primaryLink" size="lg" class="font-medium">
            {{ hero.primaryLabel }}
            <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </BaseButton>
          <BaseButton v-if="hero.secondaryLabel && hero.secondaryLink" :to="hero.secondaryLink" variant="outline-light" size="lg">
            {{ hero.secondaryLabel }}
          </BaseButton>
        </div>

        <div v-if="hero.rating !== null || hero.badgeTitle" class="mt-8 flex items-center gap-4 text-white sm:mt-6 sm:gap-6">
          <div v-if="hero.rating !== null" class="flex items-center gap-3">
            <div class="flex gap-0.5" role="img" :aria-label="`Ocena ${ratingText} od 5`">
              <Icon v-for="i in 5" :key="i" name="lucide:star" class="size-3 *:fill-current" :class="i <= filledStars ? 'text-sun' : 'text-white/30'" />
            </div>
            <div class="leading-tight">
              <p class="text-sm font-semibold sm:text-base">
                {{ ratingText }} / 5
              </p>
              <p v-if="hero.ratingLabel" class="text-[10px] font-light text-white/75">
                {{ hero.ratingLabel }}
              </p>
            </div>
          </div>
          <div v-if="hero.rating !== null && hero.badgeTitle" class="h-9 w-px shrink-0 bg-white/30" />
          <div v-if="hero.badgeTitle" class="leading-tight">
            <p class="text-sm font-semibold sm:text-base">
              {{ hero.badgeTitle }}
            </p>
            <p v-if="hero.badgeText" class="text-[10px] font-light text-white/75">
              {{ hero.badgeText }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
