<script setup lang="ts">
withDefaults(defineProps<{ light?: boolean }>(), { light: false })
</script>

<!--
  Logo SVG (824 × 306). `light` = white wordmark for dark green backgrounds (footer, mobile menu).
  -my-0.5 keeps the 28px logo inside the 24px content row of the 64px header.
-->
<template>
  <NuxtLink to="/" class="-my-0.5 inline-flex shrink-0" aria-label="Libra Herbal — početna">
    <img
      :src="light ? '/assets/img/logo-light.svg' : '/assets/img/logo.svg'"
      alt="Libra Herbal"
      width="824"
      height="306"
      class="h-7 w-auto"
    >
  </NuxtLink>
</template>
