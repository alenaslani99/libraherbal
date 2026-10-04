<script setup lang="ts">
import { sortOptions } from '~/composables/useProductFilters'

const props = defineProps<{ count: number }>()
const sort = defineModel<string>('sort', { required: true })

// Serbian plural: 1 / 21 proizvod, 2–4 / 22–24 proizvoda, 5–20 / 0 proizvoda
const countLabel = computed(() => {
  const n = props.count
  const last = n % 10
  const lastTwo = n % 100
  if (last === 1 && lastTwo !== 11) return `${n} proizvod`
  return `${n} proizvoda`
})
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <p class="text-xs text-ink" aria-live="polite">
      {{ countLabel }}
    </p>
    <BaseDropdown v-model="sort" label="Sortiraj po" :options="sortOptions" />
  </div>
</template>
