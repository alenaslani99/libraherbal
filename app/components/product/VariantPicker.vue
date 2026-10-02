<script setup lang="ts">
import type { ProductVariant } from '#shared/types/product'

defineProps<{ variants: ProductVariant[] }>()

const model = defineModel<number>({ required: true })
</script>

<!-- Figma "Odaberite gramažu": 64×32 outlined chips, radius 8, 12px gap -->
<template>
  <fieldset>
    <legend class="text-xs text-ink">
      Odaberite gramažu
    </legend>
    <div class="mt-3 flex flex-wrap gap-3">
      <label
        v-for="variant in variants"
        :key="variant.id"
        class="relative flex h-8 min-w-16 cursor-pointer items-center justify-center rounded-lg border px-3 text-xs transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun"
        :class="[
          variant.id === model ? 'border-forest bg-forest text-white' : 'border-ink/60 text-ink hover:border-forest',
          { 'text-ink/50 line-through decoration-ink/40': !variant.inStock && variant.id !== model },
        ]"
      >
        <input v-model="model" type="radio" name="varijanta" :value="variant.id" class="sr-only">
        {{ variant.label }}
        <span v-if="!variant.inStock" class="sr-only"> (nema na stanju)</span>
      </label>
    </div>
  </fieldset>
</template>
