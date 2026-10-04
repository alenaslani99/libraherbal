<script setup lang="ts">
import type { ProductIngredient } from '#shared/types/product'

const props = defineProps<{
  ingredients: ProductIngredient[]
  // product category ("Med", "Čaj"…) — picks the eyebrow wording
  category: string
}>()

// locative case for "Šta je u …?"
const locative: Record<string, string> = {
  Med: 'medu',
  Čaj: 'čaju',
  Melem: 'melemu',
}

const eyebrow = computed(() => {
  const word = locative[props.category]
  return word ? `Šta je u ${word}?` : 'Šta je unutra?'
})
</script>

<!--
  Figma "Ingredients": bg Main Green, padding 72/128, gap 64; numbered columns.
  From lg all ingredients sit in one row (one column each, --cols = count); below that they wrap.
-->
<template>
  <section v-if="ingredients.length" class="bg-forest text-white">
    <div class="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-14 sm:px-6 lg:gap-16 lg:px-16 xl:px-32 lg:py-[72px]">
      <div>
        <p class="text-xs uppercase leading-none tracking-[0.06em]">
          {{ eyebrow }}
        </p>
        <h2 class="mt-3 text-[40px] leading-none tracking-[-0.02em] text-sun">
          Sastojci
        </h2>
      </div>

      <ol
        class="grid gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
        :style="{ '--cols': ingredients.length }"
      >
        <li v-for="(ingredient, i) in ingredients" :key="ingredient.name">
          <h3 class="flex items-baseline gap-1.5 text-2xl font-normal leading-tight">
            <span class="font-sans text-xl font-semibold text-sun">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="font-sans text-xl font-semibold" aria-hidden="true">/</span>
            {{ ingredient.name }}
          </h3>
          <p class="mt-3 max-w-[260px] text-xs font-light leading-4">
            {{ ingredient.description }}
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>
