<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  eyebrow?: string
  dark?: boolean
}>(), {
  dark: false,
})
</script>

<template>
  <div>
    <p
      v-if="eyebrow"
      class="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em]"
      :class="dark ? 'text-sun' : 'text-muted'"
    >
      {{ eyebrow }}
    </p>
    <h2 class="text-4xl leading-tight sm:text-5xl" :class="dark ? 'text-white' : 'text-ink'">
      {{ title }}
    </h2>
    <p v-if="$slots.default" class="mt-3 text-sm" :class="dark ? 'text-white/75' : 'text-muted'">
      <slot />
    </p>
  </div>
</template>
