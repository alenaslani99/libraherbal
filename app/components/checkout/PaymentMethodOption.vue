<script setup lang="ts">
defineProps<{
  value: string
  title: string
  description: string
}>()

const model = defineModel<string>({ required: true })
</script>

<!-- Figma payment option: Main Beige card, thin border, radio + bold title + small note -->
<template>
  <label
    class="flex cursor-pointer items-center gap-3 rounded-md border bg-main-beige px-4 py-3 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun"
    :class="model === value ? 'border-forest' : 'border-line hover:border-brown-200'"
  >
    <input v-model="model" type="radio" name="nacin-placanja" :value="value" class="size-3.5 shrink-0 cursor-pointer accent-forest">
    <span>
      <span class="block text-xs font-semibold text-ink">{{ title }}</span>
      <span class="block text-[10px] text-ink">{{ description }}</span>
    </span>
  </label>
</template>
