<script setup lang="ts">
// Status tabs with counts + search box, above an admin list
defineProps<{
  tabs: { id: string, label: string, count: number }[]
  placeholder: string
  label: string
}>()

const status = defineModel<string>('status', { required: true })
const search = defineModel<string>('search', { required: true })
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <div class="inline-flex max-w-full overflow-x-auto rounded-md border border-zinc-200 bg-white p-0.5 text-sm" role="tablist" aria-label="Filter po statusu">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="status === tab.id"
        class="shrink-0 rounded px-3 py-1.5 font-medium whitespace-nowrap"
        :class="status === tab.id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'"
        @click="status = tab.id"
      >
        {{ tab.label }}
        <span class="ml-1 text-xs" :class="status === tab.id ? 'text-white/70' : 'text-zinc-400'">{{ tab.count }}</span>
      </button>
    </div>
    <div class="relative min-w-[220px] flex-1 sm:max-w-xs">
      <Icon name="lucide:search" class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
      <input
        v-model="search"
        type="search"
        :placeholder="placeholder"
        :aria-label="label"
        class="w-full rounded-md border border-zinc-300 bg-white py-2 pr-3 pl-9 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
      >
    </div>
  </div>
</template>
