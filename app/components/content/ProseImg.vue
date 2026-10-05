<script setup lang="ts">
withDefaults(defineProps<{
  src?: string
  alt?: string
}>(), { src: '', alt: '' })
</script>

<!-- Images inside a blog post body (![opis](url)): local or external URL, see BlogImage -->
<template>
  <BlogImage :src="src" :alt="alt" :width="765" :height="450" sizes="xs:100vw sm:100vw md:100vw lg:765px" />
</template>
