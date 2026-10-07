<script setup lang="ts">
// Countdown element of the home hero; disappears when the time is up
const props = defineProps<{
  // ISO (UTC)
  endsAt: string
  label?: string
}>()

// the server's time goes into the payload, so the first render in the browser matches the HTML
const now = useState('hero-now', () => Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => (now.value = Date.now()), 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const left = computed(() => Math.max(0, Math.floor((Date.parse(props.endsAt) - now.value) / 1000)))
const parts = computed(() => [
  { value: Math.floor(left.value / 86_400), unit: 'dana' },
  { value: Math.floor(left.value / 3600) % 24, unit: 'sati' },
  { value: Math.floor(left.value / 60) % 60, unit: 'min' },
  { value: left.value % 60, unit: 'sek' },
])
</script>

<template>
  <div v-if="left > 0" class="text-white">
    <p v-if="label" class="text-xs uppercase tracking-wider text-white/75">
      {{ label }}
    </p>
    <div class="mt-2 flex gap-2" role="timer" :aria-label="`Još ${parts[0]!.value} dana, ${parts[1]!.value} sati i ${parts[2]!.value} minuta`">
      <div v-for="part in parts" :key="part.unit" class="w-16 rounded-xl bg-white/10 py-2 text-center ring-1 ring-white/20 backdrop-blur-sm" aria-hidden="true">
        <p class="text-2xl font-semibold tabular-nums leading-none">
          {{ String(part.value).padStart(2, '0') }}
        </p>
        <p class="mt-1 text-[10px] uppercase text-white/75">
          {{ part.unit }}
        </p>
      </div>
    </div>
  </div>
</template>
