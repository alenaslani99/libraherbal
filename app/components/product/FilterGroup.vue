<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { FilterOption } from '#shared/types/product'
import { ALL } from '~/composables/useProductFilters'

const props = defineProps<{
  title: string
  name: string
  options: FilterOption[]
  // link mode: each option (and "Sve" under ALL) navigates to its own page instead of setting a value.
  // Used for the product type, where every type has its own indexable URL (/med, /cajevi, /melemi).
  links?: Record<string, RouteLocationRaw>
}>()

const model = defineModel<string>({ required: true })

const all = computed<FilterOption>(() => ({ value: ALL, label: 'Sve' }))
const items = computed(() => [all.value, ...props.options])
</script>

<!-- One group in the Filters sidebar; "Sve" (all) is always first -->
<template>
  <fieldset v-if="!links">
    <legend class="text-sm uppercase leading-4 tracking-[0.06em] text-ink">
      {{ title }}
    </legend>
    <div class="mt-4 flex flex-col gap-2">
      <FormRadio v-for="option in items" :key="option.value" v-model="model" :name="name" :value="option.value">
        {{ option.label }}
      </FormRadio>
    </div>
  </fieldset>

  <!-- same look as the radios, but real links (crawlable, open in a new tab) -->
  <nav v-else :aria-label="title">
    <p class="text-sm uppercase leading-4 tracking-[0.06em] text-ink">
      {{ title }}
    </p>
    <ul class="mt-4 flex flex-col gap-2">
      <li v-for="option in items" :key="option.value">
        <NuxtLink
          v-if="links[option.value]"
          :to="links[option.value]"
          class="flex items-center gap-2 text-xs leading-4 text-ink hover:text-forest"
          :aria-current="option.value === model ? 'page' : undefined"
        >
          <span
            class="flex size-3.5 shrink-0 items-center justify-center rounded-full border"
            :class="option.value === model ? 'border-forest' : 'border-ink/50'"
            aria-hidden="true"
          >
            <span v-if="option.value === model" class="size-2 rounded-full bg-forest" />
          </span>
          {{ option.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
