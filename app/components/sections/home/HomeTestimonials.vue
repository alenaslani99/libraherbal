<script setup lang="ts">
import type { Testimonial } from '#shared/types/engagement'

// written in /admin/utisci; the API gives the first 3 active ones
const { data: testimonials } = await useFetch<Testimonial[]>('/api/testimonials', {
  key: 'home-testimonials',
  default: () => [],
})

// initials circle colors, in card order (no customer photos)
const AVATARS = ['bg-forest text-sun', 'bg-sun text-ink', 'bg-brown-200 text-white']
</script>

<!-- Figma "User Reviews": 1440 wide, hug 452px, padding 72/128, gap 56, bg Accent Pale Beige -->
<template>
  <section v-if="testimonials.length" class="bg-pale-beige">
    <div class="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-14 sm:px-6 lg:gap-14 lg:px-16 xl:px-32 lg:py-[72px]">
      <div>
        <p class="text-xs uppercase leading-none text-ink">
          Iskustva korisnika
        </p>
        <h2 class="mt-3.5 text-[40px] leading-none tracking-[-0.02em] text-ink sm:text-[56px]">
          Uspešne priče
        </h2>
      </div>

      <!-- lg:gap-12 (48px) gives exactly 363px cards at 1440 -->
      <div class="grid gap-4 sm:gap-6 md:grid-cols-3 lg:gap-12">
        <ReviewCard
          v-for="(item, i) in testimonials"
          :key="item.id"
          :rating="item.rating"
          :text="item.text"
          :author="item.author"
          :avatar="AVATARS[i % AVATARS.length]!"
        />
      </div>
    </div>
  </section>
</template>
