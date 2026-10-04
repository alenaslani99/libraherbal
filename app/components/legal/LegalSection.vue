<script setup lang="ts">
import { legalSectionsKey } from '~/utils/legal'

const props = defineProps<{ id: string }>()

const sections = inject(legalSectionsKey, [])
const index = sections.findIndex(s => s.id === props.id)
const title = sections[index]?.title ?? props.id
</script>

<template>
  <section :id="id" class="scroll-mt-24">
    <h2 class="text-2xl leading-tight tracking-[-0.01em] text-forest sm:text-[28px]">
      {{ index + 1 }}. {{ title }}
    </h2>
    <div class="mt-3 space-y-3 text-[15px] leading-7 text-muted">
      <slot />
    </div>
  </section>
</template>
