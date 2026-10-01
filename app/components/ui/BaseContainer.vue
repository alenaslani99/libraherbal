<script setup lang="ts">
withDefaults(defineProps<{ wide?: boolean }>(), { wide: false })
</script>

<template>
  <div class="mx-auto w-full px-4 sm:px-6" :class="wide ? 'max-w-[1280px]' : 'max-w-[1152px]'">
    <slot />
  </div>
</template>
