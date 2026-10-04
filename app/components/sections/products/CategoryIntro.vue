<script setup lang="ts">
defineProps<{
  heading: string
  paragraphs: string[]
}>()
</script>

<!-- Category page text under the product grid: what the category is, ingredients, how to use (SEO + trust) -->
<template>
  <section class="bg-paper">
    <div class="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-16 xl:px-32 lg:py-[72px]">
      <div class="max-w-[720px]">
        <h2 class="text-[32px] leading-none tracking-[-0.02em] text-forest sm:text-[40px]">
          {{ heading }}
        </h2>
        <p v-for="(paragraph, i) in paragraphs" :key="i" class="mt-5 text-sm leading-6 text-ink first-of-type:mt-6">
          {{ paragraph }}
        </p>
      </div>
    </div>
  </section>
</template>
