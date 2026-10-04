<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  // optional second line in italic ("jedan korak.")
  titleItalic?: string
  // on a forest background: white title, yellow italic line
  light?: boolean
}>()
</script>

<!-- Page title block (Korpa, Plaćanje): small khaki eyebrow + large Fraunces h1 -->
<template>
  <div>
    <p v-if="eyebrow" class="text-xs uppercase leading-none tracking-[0.04em]" :class="light ? 'text-white/70' : 'text-brown-200'">
      {{ eyebrow }}
    </p>
    <h1 class="mt-3 text-[44px] leading-none tracking-[-0.02em] sm:text-[56px] lg:text-[64px]" :class="light ? 'text-white' : 'text-ink'">
      <span :class="{ block: titleItalic }">{{ title }}</span>
      <em v-if="titleItalic" class="block" :class="{ 'text-sun': light }">{{ titleItalic }}</em>
    </h1>
  </div>
</template>
