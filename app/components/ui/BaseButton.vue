<script setup lang="ts">
const props = withDefaults(defineProps<{
  to?: string
  variant?: 'sun' | 'forest' | 'outline-light'
  // md: generic; lg: Figma button (Newsletter CTA) — 44px tall, regular weight
  size?: 'md' | 'lg'
  type?: 'button' | 'submit'
}>(), {
  variant: 'sun',
  size: 'md',
  type: 'button',
})

const NuxtLink = resolveComponent('NuxtLink')

const variants = {
  'sun': 'bg-sun text-ink hover:bg-sun-hover',
  'forest': 'bg-forest text-white hover:bg-ink',
  'outline-light': 'border border-white text-white hover:bg-white hover:text-ink',
}

const sizes = {
  md: 'px-6 py-3 text-sm font-semibold',
  lg: 'h-11 px-5 text-base',
}
</script>

<template>
  <component
    :is="props.to ? NuxtLink : 'button'"
    :to="props.to"
    :type="props.to ? undefined : props.type"
    class="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
    :class="[variants[props.variant], sizes[props.size]]"
  >
    <slot />
  </component>
</template>
