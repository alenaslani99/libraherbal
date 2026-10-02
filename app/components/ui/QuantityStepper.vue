<script setup lang="ts">
const props = withDefaults(defineProps<{
  min?: number
  max?: number
  disabled?: boolean
}>(), {
  min: 1,
  max: 99,
})

const model = defineModel<number>({ default: 1 })

function step(by: number) {
  model.value = Math.min(props.max, Math.max(props.min, model.value + by))
}
</script>

<!-- Figma: pill with 1px border, "- 1 +" -->
<template>
  <div
    class="inline-flex h-9 items-center rounded-full border border-ink/60 text-sm text-ink"
    :class="{ 'opacity-50': disabled }"
  >
    <button
      type="button"
      class="flex h-full w-8 items-center justify-center rounded-l-full transition-colors hover:text-forest disabled:cursor-not-allowed disabled:opacity-40"
      aria-label="Smanji količinu"
      :disabled="disabled || model <= min"
      @click="step(-1)"
    >
      <Icon name="lucide:minus" class="size-3" />
    </button>
    <!-- fixed width fits 1–3 digits, so the pill never changes size (no layout shift) -->
    <span class="w-7 text-center tabular-nums" aria-live="polite">
      <span class="sr-only">Količina: </span>{{ model }}
    </span>
    <button
      type="button"
      class="flex h-full w-8 items-center justify-center rounded-r-full transition-colors hover:text-forest disabled:cursor-not-allowed disabled:opacity-40"
      aria-label="Povećaj količinu"
      :disabled="disabled || model >= max"
      @click="step(1)"
    >
      <Icon name="lucide:plus" class="size-3" />
    </button>
  </div>
</template>
