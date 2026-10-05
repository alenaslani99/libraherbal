<script setup lang="ts">
defineProps<{
  src: string
  alt: string
  width: number
  height: number
  sizes: string
  // above the fold: load right away instead of lazily
  priority?: boolean
}>()
</script>

<!--
  Blog images are plain URLs typed in /admin (no upload storage yet).
  Site paths (/assets/...) go through NuxtImg (resized webp); external URLs are shown as they are,
  since the image optimizer only accepts its own files.
-->
<template>
  <NuxtImg
    v-if="src.startsWith('/')"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :sizes="sizes"
    format="webp"
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : undefined"
  />
  <img
    v-else
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="priority ? 'eager' : 'lazy'"
    :fetchpriority="priority ? 'high' : undefined"
    referrerpolicy="no-referrer"
  >
</template>
