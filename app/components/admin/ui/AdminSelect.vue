<script setup lang="ts" generic="T extends string | number | null">
// Admin dropdown: the storefront BaseDropdown's behavior (chevron flips, menu slides in,
// arrow keys / Enter / Esc) in the admin's zinc look, full width like an input.
const props = defineProps<{
  options: { value: T, label: string, hint?: string }[]
  // accessible name; also pass `id` so a <label for> can point at the button
  label: string
  id?: string
  // text while nothing is chosen
  placeholder?: string
  invalid?: boolean
}>()

const model = defineModel<T>({ required: true })

const uid = useId()
const listId = computed(() => `${props.id ?? uid}-list`)
const open = ref(false)
const activeIndex = ref(0)
const root = ref<HTMLElement>()
const button = ref<HTMLButtonElement>()
const optionEls = ref<HTMLElement[]>([])

const selected = computed(() => props.options.find(o => o.value === model.value))

async function show() {
  activeIndex.value = Math.max(0, props.options.findIndex(o => o.value === model.value))
  open.value = true
  await nextTick()
  optionEls.value[activeIndex.value]?.focus()
  optionEls.value[activeIndex.value]?.scrollIntoView({ block: 'nearest' })
}

function hide(returnFocus = true) {
  open.value = false
  if (returnFocus) button.value?.focus()
}

function choose(value: T) {
  model.value = value
  hide()
}

function move(step: number) {
  const count = props.options.length
  activeIndex.value = (activeIndex.value + step + count) % count
  optionEls.value[activeIndex.value]?.focus()
}

function onOutsidePointer(event: PointerEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) hide(false)
}

onMounted(() => document.addEventListener('pointerdown', onOutsidePointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutsidePointer))
</script>

<template>
  <div ref="root" class="relative" @keydown.esc="open && hide()">
    <button
      :id="id"
      ref="button"
      type="button"
      class="flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-left text-sm shadow-xs transition-colors focus:outline-none focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900"
      :class="[
        invalid ? 'border-red-500' : open ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-300 hover:border-zinc-400',
        selected ? 'text-zinc-900' : 'text-zinc-400',
      ]"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-label="`${label}: ${selected?.label ?? placeholder ?? ''}`"
      @click="open ? hide() : show()"
      @keydown.down.prevent="show()"
      @keydown.up.prevent="show()"
    >
      <span class="truncate">{{ selected?.label ?? placeholder ?? '' }}</span>
      <Icon name="lucide:chevron-down" class="size-4 shrink-0 text-zinc-500 transition-transform duration-200" :class="{ 'rotate-180': open }" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="-translate-y-1 opacity-0"
    >
      <ul
        v-show="open"
        :id="listId"
        role="listbox"
        :aria-label="label"
        class="absolute inset-x-0 z-30 mt-1 max-h-64 min-w-max overflow-y-auto rounded-md border border-zinc-200 bg-white p-1 shadow-lg"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.tab="hide(false)"
      >
        <li
          v-for="(option, i) in options"
          :key="String(option.value)"
          ref="optionEls"
          role="option"
          tabindex="-1"
          :aria-selected="option.value === model"
          class="flex cursor-pointer items-center justify-between gap-4 rounded px-2.5 py-1.5 text-sm text-zinc-900 outline-none hover:bg-zinc-100 focus:bg-zinc-100"
          @click="choose(option.value)"
          @keydown.enter.prevent="choose(option.value)"
          @keydown.space.prevent="choose(option.value)"
          @mouseenter="activeIndex = i"
        >
          <span>
            {{ option.label }}
            <span v-if="option.hint" class="ml-1 text-xs text-zinc-400">{{ option.hint }}</span>
          </span>
          <Icon v-if="option.value === model" name="lucide:check" class="size-4 shrink-0 text-zinc-900" />
        </li>
      </ul>
    </Transition>
  </div>
</template>
