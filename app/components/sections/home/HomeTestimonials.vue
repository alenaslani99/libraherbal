<script setup lang="ts">
import { testimonials } from '~/data/home'
</script>

<!-- Figma "User Reviews": 1440 wide, hug 452px, padding 72/128, gap 56, bg Accent Pale Beige -->
<template>
  <section class="bg-pale-beige">
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
          v-for="item in testimonials"
          :key="item.id"
          :rating="item.rating"
          :text="item.text"
          :author="item.author"
          :avatar="item.avatar"
        />
      </div>
    </div>
  </section>
</template>
