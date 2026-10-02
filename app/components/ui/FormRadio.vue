<script setup lang="ts">
defineProps<{
  name: string
  value: string
}>()

const model = defineModel<string>()
</script>

<template>
  <label class="flex cursor-pointer items-center gap-2 text-xs leading-4 text-ink">
    <input
      v-model="model"
      type="radio"
      :name="name"
      :value="value"
      class="size-3.5 shrink-0 cursor-pointer accent-forest"
    >
    <span><slot /></span>
  </label>
</template>
