<script setup lang="ts">
const props = defineProps<{
  rating: number
  text: string
  author: string
  avatar: string
}>()

const initials = computed(() =>
  props.author.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
)
</script>

<!-- Figma "Review Card": 363 wide (fluid; 363px at 1440), hug (min 170px), border 1px brown-200, padding 24, gap 24, bg Off-white -->
<template>
  <figure class="flex min-h-[170px] flex-col gap-6 border border-brown-200 bg-paper p-5 sm:p-6">
    <div class="flex gap-0.5" :aria-label="`Ocena ${rating} od 5`" role="img">
      <Icon
        v-for="i in 5"
        :key="i"
        name="lucide:star"
        class="size-3 *:fill-current"
        :class="i <= rating ? 'text-sun' : 'text-brown-200'"
      />
    </div>

    <div class="flex flex-1 flex-col gap-4">
      <blockquote class="text-sm leading-[18px] text-ink">
        “{{ text }}”
      </blockquote>
      <figcaption class="mt-auto flex items-center gap-2.5">
        <span
          class="flex size-7 items-center justify-center rounded-full text-[11px] font-semibold"
          :class="avatar"
          aria-hidden="true"
        >
          {{ initials }}
        </span>
        <span class="font-heading text-sm font-medium italic text-ink">{{ author }}</span>
      </figcaption>
    </div>
  </figure>
</template>
