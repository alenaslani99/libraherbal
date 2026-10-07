<script setup lang="ts">
import type { DashboardBucket } from '#shared/types/dashboard'

// Revenue per day (or per week) as columns. One series, so no legend: the card title names it.
// Each column is a focusable hit target with its own tooltip; the same numbers are in the table view.
const props = defineProps<{
  buckets: DashboardBucket[]
  weekly: boolean
}>()

const PLOT_HEIGHT = 200

// clean y-axis: 4 steps of 1 / 2 / 2.5 / 5 × 10^k
const scale = computed(() => {
  const max = Math.max(0, ...props.buckets.map(b => b.revenue))
  if (!max) return { top: 4000, ticks: [0, 1000, 2000, 3000, 4000] }
  const rough = max / 4
  const power = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map(f => f * power).find(s => s >= rough)!
  const top = step * Math.ceil(max / step)
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) }
})

const peak = computed(() => props.buckets.reduce((best, b, i) => (b.revenue > (props.buckets[best]?.revenue ?? 0) ? i : best), -1))
const empty = computed(() => props.buckets.every(b => !b.orders))

const WEEKDAYS = ['ned', 'pon', 'uto', 'sre', 'čet', 'pet', 'sub']
// read from the 'YYYY-MM-DD' string, never through the browser's time zone
function dayMonth(date: string) {
  const [, m, d] = date.split('-').map(Number)
  return `${d}.${m}.`
}
function weekday(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return WEEKDAYS[new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay()]!
}
function bucketLabel(b: DashboardBucket) {
  return b.date === b.endDate ? `${weekday(b.date)} ${dayMonth(b.date)}` : `${dayMonth(b.date)} – ${dayMonth(b.endDate)}`
}

// x labels: about 7 across, so they never collide
const labelEvery = computed(() => Math.max(1, Math.ceil(props.buckets.length / 7)))
const axisLabel = (b: DashboardBucket) => (props.buckets.length <= 7 ? weekday(b.date) : dayMonth(b.date))

const height = (value: number) => (value / scale.value.top) * PLOT_HEIGHT

// one tooltip at a time: hover or keyboard focus
const active = ref<number | null>(null)
// near the edges the tooltip leans inward instead of overflowing the card
function tooltipAlign(i: number) {
  const n = props.buckets.length
  if (i < n * 0.15) return 'left-0'
  if (i > n * 0.85) return 'right-0'
  return 'left-1/2 -translate-x-1/2'
}
</script>

<template>
  <div>
    <div class="flex gap-3">
      <!-- y axis -->
      <div class="relative w-12 shrink-0 text-right text-[11px] text-zinc-400 tabular-nums" :style="{ height: `${PLOT_HEIGHT}px` }" aria-hidden="true">
        <span
          v-for="tick in scale.ticks"
          :key="tick"
          class="absolute right-0 leading-none"
          :style="{ bottom: `${height(tick)}px`, transform: 'translateY(50%)' }"
        >{{ tick }}</span>
      </div>

      <div class="relative min-w-0 flex-1">
        <!-- gridlines: hairline, solid, recessive -->
        <div class="pointer-events-none absolute inset-x-0 top-0" :style="{ height: `${PLOT_HEIGHT}px` }" aria-hidden="true">
          <div
            v-for="tick in scale.ticks"
            :key="tick"
            class="absolute inset-x-0 h-px"
            :class="tick === 0 ? 'bg-zinc-300' : 'bg-zinc-100'"
            :style="{ bottom: `${height(tick)}px` }"
          />
        </div>

        <p v-if="empty" class="absolute inset-x-0 top-0 flex items-center justify-center text-sm text-zinc-400" :style="{ height: `${PLOT_HEIGHT}px` }">
          Nema porudžbina u ovom periodu.
        </p>

        <!-- columns: each slot is the hit target, the bar inside is max 24px with 2px air between -->
        <ul class="relative flex gap-[2px]" :style="{ height: `${PLOT_HEIGHT}px` }" aria-label="Prihod po danu">
          <li
            v-for="(b, i) in buckets"
            :key="b.date"
            class="relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
            tabindex="0"
            :aria-label="`${bucketLabel(b)}: ${b.revenue},00 RSD, porudžbina: ${b.orders}`"
            @pointerenter="active = i"
            @pointerleave="active = null"
            @focus="active = i"
            @blur="active = null"
          >
            <div
              class="w-full max-w-6 rounded-t-[4px] transition-colors"
              :class="active === i ? 'bg-zinc-500' : 'bg-zinc-800'"
              :style="{ height: `${height(b.revenue)}px` }"
            />
            <!-- the one direct label: the best day/week -->
            <span
              v-if="i === peak && b.revenue && active === null"
              class="pointer-events-none absolute text-[11px] font-medium whitespace-nowrap text-zinc-700"
              :style="{ bottom: `${height(b.revenue) + 4}px` }"
            >{{ b.revenue }}</span>

            <div
              v-if="active === i"
              class="pointer-events-none absolute z-10 min-w-36 rounded-md bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-zinc-200"
              :class="tooltipAlign(i)"
              :style="{ bottom: `${Math.min(height(b.revenue), PLOT_HEIGHT - 60) + 8}px` }"
              role="tooltip"
            >
              <p class="text-sm font-semibold whitespace-nowrap text-zinc-900">
                {{ b.revenue }},00 RSD
              </p>
              <p class="mt-0.5 whitespace-nowrap text-zinc-500">
                {{ b.orders }} {{ plural(b.orders, 'porudžbina', 'porudžbine', 'porudžbina') }} · {{ bucketLabel(b) }}
              </p>
            </div>
          </li>
        </ul>

        <!-- x axis -->
        <div class="mt-2 flex gap-[2px] text-[11px] text-zinc-400" aria-hidden="true">
          <span v-for="(b, i) in buckets" :key="b.date" class="min-w-0 flex-1 text-center whitespace-nowrap">
            {{ i % labelEvery === 0 ? axisLabel(b) : '' }}
          </span>
        </div>
      </div>
    </div>

    <details class="mt-4 text-sm">
      <summary class="cursor-pointer text-xs font-medium text-zinc-500 hover:text-zinc-900">
        Prikaži kao tabelu
      </summary>
      <div class="mt-2 max-h-64 overflow-y-auto rounded-md border border-zinc-200">
        <table class="w-full text-left text-xs">
          <thead class="sticky top-0 bg-zinc-50 text-zinc-500">
            <tr>
              <th scope="col" class="px-3 py-1.5 font-medium">
                {{ weekly ? 'Nedelja' : 'Dan' }}
              </th>
              <th scope="col" class="px-3 py-1.5 text-right font-medium">
                Porudžbine
              </th>
              <th scope="col" class="px-3 py-1.5 text-right font-medium">
                Prihod
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 tabular-nums">
            <tr v-for="b in [...buckets].reverse()" :key="b.date">
              <td class="px-3 py-1.5 text-zinc-700">
                {{ bucketLabel(b) }}
              </td>
              <td class="px-3 py-1.5 text-right text-zinc-700">
                {{ b.orders }}
              </td>
              <td class="px-3 py-1.5 text-right text-zinc-900">
                {{ b.revenue }},00 RSD
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </div>
</template>
