<script setup lang="ts">
defineProps<{
  name: string
  icon: string
  to: string
}>()
</script>

<!-- Figma "CB … Desktop": 230 wide (fluid: fills its grid column), hug 114px, border 1px brown-200, padding 20, gap 32, bg #F4EEE2 -->
<template>
  <NuxtLink
    :to="to"
    class="group -ml-px -mt-px flex flex-col gap-6 border border-brown-200 bg-linen p-4 text-ink transition-colors duration-200 last:col-span-2 hover:bg-white sm:gap-8 sm:p-5 sm:last:col-span-1"
  >
    <Icon :name="icon" class="size-5" />
    <span class="flex items-center justify-between gap-3">
      <span class="font-heading text-base font-semibold leading-5">{{ name }}</span>
      <Icon name="lucide:arrow-right" class="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
    </span>
  </NuxtLink>
</template>
