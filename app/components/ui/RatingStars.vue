<script setup lang="ts">
const props = defineProps<{ rating: number }>()

// per star: 1 = full, 0.5 = half, 0 = empty (rounded to the nearest half)
const stars = computed(() => {
  const rounded = Math.round(props.rating * 2) / 2
  return Array.from({ length: 5 }, (_, i) => Math.min(1, Math.max(0, rounded - i)))
})
</script>

<!-- Figma: 5 small yellow stars, empty part in muted grey -->
<template>
  <div class="flex gap-0.5" role="img" :aria-label="`Ocena ${String(rating).replace('.', ',')} od 5`">
    <span v-for="(fill, i) in stars" :key="i" class="relative size-3.5">
      <Icon name="lucide:star" class="absolute inset-0 size-3.5 text-brown-200/50 *:fill-current" />
      <Icon v-if="fill === 1" name="lucide:star" class="absolute inset-0 size-3.5 text-sun *:fill-current" />
      <Icon v-else-if="fill === 0.5" name="lucide:star-half" class="absolute inset-0 size-3.5 text-sun *:fill-current" />
    </span>
  </div>
</template>
