<script setup lang="ts">
withDefaults(defineProps<{ light?: boolean }>(), { light: false })
</script>

<!-- Text logo until the real logo SVG is provided -->
<template>
  <NuxtLink
    to="/"
    class="font-heading text-2xl leading-6 tracking-[0.08em]"
    :class="light ? 'text-white' : 'text-forest'"
    aria-label="Libra Herbal — početna"
  >
    LIBRA
  </NuxtLink>
</template>
