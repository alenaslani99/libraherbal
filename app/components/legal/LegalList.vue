<script setup lang="ts">
// string = plain item; { term, text } = bold term followed by its explanation
type Item = string | { term: string, text: string }

withDefaults(defineProps<{
  items: Item[]
  variant?: 'check' | 'dot'
}>(), {
  variant: 'check',
})
</script>

<template>
  <ul class="space-y-2">
    <li v-for="item in items" :key="typeof item === 'string' ? item : item.term" class="flex gap-3">
      <Icon v-if="variant === 'check'" name="lucide:check" class="mt-1.5 size-4 shrink-0 text-forest" />
      <span v-else class="mt-3 size-1.5 shrink-0 rounded-full bg-sun-dark" aria-hidden="true" />
      <span v-if="typeof item === 'string'">{{ item }}</span>
      <span v-else><strong class="font-semibold text-ink">{{ item.term }}</strong> – {{ item.text }}</span>
    </li>
  </ul>
</template>
