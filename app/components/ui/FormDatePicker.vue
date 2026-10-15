<script setup lang="ts">
// Date field in the site's style (the browser's own picker can't be styled): a field like FormField that
// opens a panel with days, months and years. Value is YYYY-MM-DD ('' = none), shown as day.month.year.
// For birthdays it starts on the years, so picking 1990 doesn't take 400 clicks back through the months.
const props = withDefaults(defineProps<{
  label: string
  placeholder?: string
  required?: boolean
  error?: string
  // earliest and latest day, YYYY-MM-DD
  min?: string
  max?: string
  // the year the panel opens on while nothing is picked
  startYear?: number
  // from sm up the panel is wider than a half-width field: which edge of the field it lines up with
  align?: 'left' | 'right'
}>(), {
  align: 'left',
  placeholder: 'dd.mm.gggg.',
  required: false,
  startYear: 1990,
})

const model = defineModel<string>({ default: '' })
const id = useId()

const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
const WEEKDAYS = ['Po', 'Ut', 'Sr', 'Če', 'Pe', 'Su', 'Ne']
const YEARS_PER_PAGE = 20

type View = 'days' | 'months' | 'years'

const open = ref(false)
const view = ref<View>('years')
// the month on screen (month 0–11) and the first year of the year page
const shownYear = ref(props.startYear)
const shownMonth = ref(0)
const yearPageStart = ref(0)
// the day the arrow keys move, YYYY-MM-DD
const focusDay = ref('')

const root = ref<HTMLElement>()
const field = ref<HTMLButtonElement>()
const panel = ref<HTMLElement>()

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parts(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return { year: y!, month: m! - 1, day: d! }
}

const display = computed(() => {
  if (!model.value) return ''
  const { year, month, day } = parts(model.value)
  return `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}.`
})

const minYear = computed(() => props.min ? parts(props.min).year : 1900)
const maxYear = computed(() => props.max ? parts(props.max).year : new Date().getFullYear() + 10)

function outOfRange(value: string) {
  return (!!props.min && value < props.min) || (!!props.max && value > props.max)
}

// 6 rows × 7 days, weeks start on Monday; days of the neighbouring months are blank
const weeks = computed(() => {
  const first = new Date(Date.UTC(shownYear.value, shownMonth.value, 1))
  const offset = (first.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(shownYear.value, shownMonth.value + 1, 0)).getUTCDate()
  const cells: (string | null)[] = Array.from({ length: offset }, () => null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(iso(shownYear.value, shownMonth.value, day))
  while (cells.length % 7) cells.push(null)
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7))
})

const years = computed(() => Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPageStart.value + i))

const title = computed(() => {
  if (view.value === 'days') return `${MONTHS[shownMonth.value]} ${shownYear.value}`
  if (view.value === 'months') return String(shownYear.value)
  return `${years.value[0]} – ${years.value.at(-1)}`
})

function pageOf(year: number) {
  return year - ((year - 1900) % YEARS_PER_PAGE + YEARS_PER_PAGE) % YEARS_PER_PAGE
}

async function show() {
  if (model.value) {
    const { year, month } = parts(model.value)
    shownYear.value = year
    shownMonth.value = month
    focusDay.value = model.value
    view.value = 'days'
  }
  else {
    shownYear.value = Math.min(Math.max(props.startYear, minYear.value), maxYear.value)
    view.value = 'years'
  }
  yearPageStart.value = pageOf(shownYear.value)
  open.value = true
  await nextTick()
  focusCurrent()
}

function hide(returnFocus = true) {
  open.value = false
  if (returnFocus) field.value?.focus()
}

// keyboard focus on the selected/active cell of the current view
function focusCurrent() {
  const target = view.value === 'days'
    ? panel.value?.querySelector<HTMLElement>(`[data-day="${focusDay.value}"]`) ?? panel.value?.querySelector<HTMLElement>('[data-day]:not([disabled])')
    : panel.value?.querySelector<HTMLElement>('[data-current="true"]') ?? panel.value?.querySelector<HTMLElement>('[data-cell]:not([disabled])')
  target?.focus()
}

async function step(direction: -1 | 1) {
  if (view.value === 'days') {
    const next = new Date(Date.UTC(shownYear.value, shownMonth.value + direction, 1))
    shownYear.value = next.getUTCFullYear()
    shownMonth.value = next.getUTCMonth()
  }
  else if (view.value === 'months') {
    shownYear.value += direction
  }
  else {
    yearPageStart.value += direction * YEARS_PER_PAGE
  }
}

const canStepBack = computed(() => {
  if (view.value === 'days') return shownYear.value * 12 + shownMonth.value > minYear.value * 12 + (props.min ? parts(props.min).month : 0)
  if (view.value === 'months') return shownYear.value > minYear.value
  return yearPageStart.value > minYear.value
})
const canStepForward = computed(() => {
  if (view.value === 'days') return shownYear.value * 12 + shownMonth.value < maxYear.value * 12 + (props.max ? parts(props.max).month : 11)
  if (view.value === 'months') return shownYear.value < maxYear.value
  return yearPageStart.value + YEARS_PER_PAGE - 1 < maxYear.value
})

async function zoomOut() {
  if (view.value === 'days') view.value = 'months'
  else if (view.value === 'months') {
    yearPageStart.value = pageOf(shownYear.value)
    view.value = 'years'
  }
  await nextTick()
  focusCurrent()
}

async function pickYear(year: number) {
  shownYear.value = year
  view.value = 'months'
  await nextTick()
  focusCurrent()
}

async function pickMonth(month: number) {
  shownMonth.value = month
  focusDay.value = iso(shownYear.value, month, 1)
  view.value = 'days'
  await nextTick()
  focusCurrent()
}

function pickDay(value: string) {
  model.value = value
  hide()
}

// arrows move a day / a week, PageUp/PageDown a month, in the days view
async function onDayKey(event: KeyboardEvent) {
  const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
  const { year, month, day } = parts(focusDay.value || iso(shownYear.value, shownMonth.value, 1))
  let next: Date
  if (event.key in moves) next = new Date(Date.UTC(year, month, day + moves[event.key]!))
  else if (event.key === 'PageUp' || event.key === 'PageDown') next = new Date(Date.UTC(year, month + (event.key === 'PageUp' ? -1 : 1), day))
  else return
  event.preventDefault()
  const value = iso(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate())
  if (outOfRange(value)) return
  focusDay.value = value
  shownYear.value = next.getUTCFullYear()
  shownMonth.value = next.getUTCMonth()
  await nextTick()
  focusCurrent()
}

function monthDisabled(month: number) {
  return (!!props.min && iso(shownYear.value, month, 31) < props.min) || (!!props.max && iso(shownYear.value, month, 1) > props.max)
}

function onOutsidePointer(event: PointerEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) hide(false)
}

onMounted(() => document.addEventListener('pointerdown', onOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutsidePointer))
</script>

<!-- Looks like FormField; the panel follows the site's dropdown (paper, line border, rounded-2xl) -->
<template>
  <div ref="root" class="relative" @keydown.esc="open && hide()">
    <label :for="id" class="mb-1.5 block text-xs font-semibold text-ink">
      {{ label }}
    </label>
    <button
      :id="id"
      ref="field"
      type="button"
      class="flex h-11 w-full items-center justify-between rounded-md border bg-white/30 px-3.5 text-left text-sm transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4"
      :class="[
        error ? 'border-red-700 focus:border-red-700 focus:ring-red-700/15' : 'border-line focus:border-forest focus:ring-forest/15',
        open && !error ? 'border-forest ring-4 ring-forest/15' : '',
      ]"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :aria-controls="`${id}-panel`"
      :aria-invalid="!!error"
      :aria-required="required"
      :aria-describedby="error ? `${id}-error` : undefined"
      @click="open ? hide() : show()"
      @keydown.down.prevent="!open && show()"
    >
      <span :class="display ? 'text-ink' : 'text-brown-200'">{{ display || placeholder }}</span>
      <Icon name="lucide:calendar" class="size-4 text-brown-200" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="-translate-y-1 opacity-0"
    >
      <div
        v-show="open"
        :id="`${id}-panel`"
        ref="panel"
        role="dialog"
        :aria-label="label"
        class="absolute inset-x-0 z-30 mt-2 rounded-2xl border border-line bg-paper p-4 shadow-lg shadow-black/10 sm:w-80"
        :class="align === 'right' ? 'sm:left-auto' : 'sm:right-auto'"
      >
        <div class="flex items-center justify-between gap-2">
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-pale-beige focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun disabled:pointer-events-none disabled:opacity-30"
            :disabled="!canStepBack"
            :aria-label="view === 'days' ? 'Prethodni mesec' : view === 'months' ? 'Prethodna godina' : 'Prethodne godine'"
            @click="step(-1)"
          >
            <Icon name="lucide:chevron-left" class="size-4" />
          </button>
          <button
            type="button"
            class="flex items-center gap-1 rounded-full px-3 py-1.5 font-heading text-lg font-semibold text-forest transition-colors hover:bg-pale-beige focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun disabled:pointer-events-none"
            :disabled="view === 'years'"
            :aria-label="view === 'days' ? `${title}, izaberite mesec` : view === 'months' ? `${title}, izaberite godinu` : title"
            @click="zoomOut"
          >
            {{ title }}
            <Icon v-if="view !== 'years'" name="lucide:chevron-down" class="size-3.5 text-brown-200" />
          </button>
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-pale-beige focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun disabled:pointer-events-none disabled:opacity-30"
            :disabled="!canStepForward"
            :aria-label="view === 'days' ? 'Sledeći mesec' : view === 'months' ? 'Sledeća godina' : 'Sledeće godine'"
            @click="step(1)"
          >
            <Icon name="lucide:chevron-right" class="size-4" />
          </button>
        </div>

        <!-- days -->
        <div v-if="view === 'days'" class="mt-3" @keydown="onDayKey">
          <div class="grid grid-cols-7 text-center text-[0.6875rem] font-semibold uppercase tracking-wide text-brown-200">
            <span v-for="weekday in WEEKDAYS" :key="weekday" class="py-1.5">{{ weekday }}</span>
          </div>
          <div v-for="(week, w) in weeks" :key="w" class="grid grid-cols-7">
            <div v-for="(day, d) in week" :key="d" class="flex justify-center py-0.5">
              <button
                v-if="day"
                type="button"
                :data-day="day"
                :tabindex="day === focusDay ? 0 : -1"
                :disabled="outOfRange(day)"
                :aria-pressed="day === model"
                class="flex size-9 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sun disabled:pointer-events-none disabled:text-brown-200/50"
                :class="day === model ? 'bg-forest font-semibold text-white' : 'text-ink hover:bg-pale-beige'"
                @click="pickDay(day)"
                @focus="focusDay = day"
              >
                {{ Number(day.slice(8)) }}
              </button>
            </div>
          </div>
        </div>

        <!-- months -->
        <div v-else-if="view === 'months'" class="mt-3 grid grid-cols-3 gap-1.5">
          <button
            v-for="(name, month) in MONTHS"
            :key="name"
            type="button"
            data-cell
            :data-current="model && parts(model).year === shownYear && parts(model).month === month"
            :disabled="monthDisabled(month)"
            class="rounded-xl py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sun disabled:pointer-events-none disabled:text-brown-200/50"
            :class="model && parts(model).year === shownYear && parts(model).month === month ? 'bg-forest font-semibold text-white' : 'text-ink hover:bg-pale-beige'"
            @click="pickMonth(month)"
          >
            {{ name.slice(0, 3) }}
          </button>
        </div>

        <!-- years -->
        <div v-else class="mt-3 grid grid-cols-4 gap-1.5">
          <button
            v-for="year in years"
            :key="year"
            type="button"
            data-cell
            :data-current="year === shownYear"
            :disabled="year < minYear || year > maxYear"
            class="rounded-xl py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sun disabled:pointer-events-none disabled:text-brown-200/50"
            :class="model && parts(model).year === year ? 'bg-forest font-semibold text-white' : year === shownYear ? 'bg-sun-light/60 text-ink hover:bg-sun-light' : 'text-ink hover:bg-pale-beige'"
            @click="pickYear(year)"
          >
            {{ year }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- always rendered: the reserved line keeps the form from jumping when a message appears -->
    <p :id="`${id}-error`" class="mt-1 min-h-4 text-xs leading-4 text-red-700" aria-live="polite">
      {{ error }}
    </p>
  </div>
</template>
