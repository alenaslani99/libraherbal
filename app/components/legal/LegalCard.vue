<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  // highlighted: tinted background with the icon in a tile (Pouzeće); default: outlined grid card
  highlighted?: boolean
}>()
</script>

<template>
  <div
    class="rounded-xl"
    :class="highlighted ? 'flex gap-4 bg-forest/[0.06] p-5' : 'border border-line bg-cream/60 p-4'"
  >
    <span v-if="highlighted" class="grid size-10 shrink-0 place-items-center rounded-lg bg-forest/10 text-forest">
      <Icon :name="icon" class="size-5" />
    </span>
    <Icon v-else :name="icon" class="size-5 text-sun-dark" />
    <div :class="{ 'mt-3': !highlighted }">
      <p class="font-semibold leading-6 text-ink">
        {{ title }}
      </p>
      <p class="mt-1 text-sm leading-6 text-muted">
        <slot />
      </p>
    </div>
  </div>
</template>
