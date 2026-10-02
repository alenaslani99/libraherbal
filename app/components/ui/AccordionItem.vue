<script setup lang="ts">
defineProps<{
  title: string
  open?: boolean
}>()
</script>

<!-- Native <details>: keyboard + screen reader support for free, works before hydration -->
<template>
  <details class="group border-b border-brown-200/60 py-4" :open="open">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
      {{ title }}
      <Icon name="lucide:chevron-down" class="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
    </summary>
    <div class="pt-3 text-xs leading-4 text-ink">
      <slot />
    </div>
  </details>
</template>
