<script setup lang="ts">
import type { FilterOption } from '#shared/types/product'
import { ALL } from '~/composables/useProductFilters'

defineProps<{
  title: string
  name: string
  options: FilterOption[]
}>()

const model = defineModel<string>({ required: true })
</script>

<!-- One radio group in the Filters sidebar; "Sve" (all) is always first -->
<template>
  <fieldset>
    <legend class="text-sm uppercase leading-4 tracking-[0.06em] text-ink">
      {{ title }}
    </legend>
    <div class="mt-4 flex flex-col gap-2">
      <FormRadio v-model="model" :name="name" :value="ALL">
        Sve
      </FormRadio>
      <FormRadio v-for="option in options" :key="option.value" v-model="model" :name="name" :value="option.value">
        {{ option.label }}
      </FormRadio>
    </div>
  </fieldset>
</template>
