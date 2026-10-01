<script setup lang="ts">
import { topBarItems } from '~/data/navigation'
</script>

<!-- Phones show only the first message on one line; from sm up all messages with dots between -->
<template>
  <div class="flex min-h-[34px] items-center justify-center bg-ink px-4 py-2 text-[11px] leading-none text-white sm:text-xs">
    <ul class="flex items-center justify-center gap-x-4 text-center">
      <template v-for="(item, i) in topBarItems" :key="item">
        <li v-if="i > 0" class="hidden size-1.5 shrink-0 rounded-full bg-sun sm:block" aria-hidden="true" />
        <li :class="i > 0 ? 'hidden sm:block' : ''">
          {{ item }}
        </li>
      </template>
    </ul>
  </div>
</template>
