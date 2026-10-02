<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  // optional second line in italic ("jedan korak.")
  titleItalic?: string
}>()
</script>

<!-- Page title block (Korpa, Plaćanje): small khaki eyebrow + large Fraunces h1 -->
<template>
  <div>
    <p v-if="eyebrow" class="text-xs uppercase leading-none tracking-[0.04em] text-brown-200">
      {{ eyebrow }}
    </p>
    <h1 class="mt-3 text-[44px] leading-none tracking-[-0.02em] text-ink sm:text-[56px] lg:text-[64px]">
      <span :class="{ block: titleItalic }">{{ title }}</span>
      <em v-if="titleItalic" class="block">{{ titleItalic }}</em>
    </h1>
  </div>
</template>
