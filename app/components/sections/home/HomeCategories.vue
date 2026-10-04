<script setup lang="ts">
import { homeCategories } from '~/data/home'
</script>

<!-- Figma "Category": 1440 wide, hug 395px, padding 72/128, gap 40, bg Accent Pale Beige -->
<template>
  <section class="bg-pale-beige">
    <div class="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-14 sm:px-6 lg:px-16 xl:px-32 lg:py-[72px]">
      <div>
        <h2 class="text-[40px] leading-none tracking-[-0.02em] text-ink sm:text-[56px]">
          Niste sigurni šta tražite?
        </h2>
        <p class="mt-3 text-base sm:mt-[21px] font-light leading-5 text-black">
          Pogledajte naše kategorije proizvoda.
        </p>
      </div>

      <!-- pl-px/pt-px + -ml-px/-mt-px on blocks collapse the shared 1px borders -->
      <!-- phones 2 columns (last block full width), tablets 3, lg+ one row of 5 -->
      <nav aria-label="Kategorije proizvoda" class="grid grid-cols-2 pl-px pt-px sm:grid-cols-3 lg:grid-cols-5">
        <CategoryBlock
          v-for="category in homeCategories"
          :key="category.slug"
          :name="category.name"
          :icon="category.icon"
          :to="`/proizvodi?kategorija=${category.slug}`"
        />
      </nav>
    </div>
  </section>
</template>
