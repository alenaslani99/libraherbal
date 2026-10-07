<script setup lang="ts">
// One KPI: label, value, change vs the previous period. The arrow + sign carry the direction;
// green/red says whether that direction is good (more revenue: good, more cancellations: bad).
const props = defineProps<{
  label: string
  value: number
  previous: number
  // RSD amounts print as "12340,00 RSD"
  money?: boolean
  // for counts where going up is bad (cancellations)
  upIsBad?: boolean
}>()

const change = computed(() => {
  if (props.value === props.previous) return { dir: 'same' as const, text: '0%' }
  // from nothing there is no percentage, only the direction
  if (!props.previous) return { dir: 'up' as const, text: 'novo' }
  const pct = Math.round(((props.value - props.previous) / props.previous) * 100)
  return { dir: props.value > props.previous ? 'up' as const : 'down' as const, text: `${pct > 0 ? '+' : ''}${pct}%` }
})

const tone = computed(() => {
  if (change.value.dir === 'same') return 'bg-zinc-100 text-zinc-600'
  const good = (change.value.dir === 'up') !== Boolean(props.upIsBad)
  return good ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
})

const format = (n: number) => (props.money ? `${n},00 RSD` : String(n))
</script>

<template>
  <div class="rounded-lg border border-zinc-200 bg-white p-4">
    <div class="flex items-start justify-between gap-2">
      <p class="text-sm text-zinc-500">
        {{ label }}
      </p>
      <span class="inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap" :class="tone">
        <Icon
          :name="change.dir === 'up' ? 'lucide:arrow-up-right' : change.dir === 'down' ? 'lucide:arrow-down-right' : 'lucide:minus'"
          class="size-3.5"
        />
        {{ change.text }}
      </span>
    </div>
    <p class="mt-1.5 text-2xl font-semibold tracking-tight whitespace-nowrap text-zinc-900">
      {{ value }}<template v-if="money">,00<span class="ml-1 text-sm font-medium text-zinc-500">RSD</span></template>
    </p>
    <p class="mt-1 truncate text-xs text-zinc-400">
      Prethodni period: {{ format(previous) }}
    </p>
  </div>
</template>
