<script setup lang="ts">
export interface DropdownOption {
  value: string
  label: string
}

const props = defineProps<{
  options: DropdownOption[]
  // accessible name, e.g. "Sortiraj po"
  label: string
}>()

const model = defineModel<string>({ required: true })

const id = useId()
const open = ref(false)
const activeIndex = ref(0)
const root = ref<HTMLElement>()
const button = ref<HTMLButtonElement>()
const optionEls = ref<HTMLElement[]>([])

const selected = computed(() => props.options.find(o => o.value === model.value) ?? props.options[0])

async function show() {
  activeIndex.value = Math.max(0, props.options.findIndex(o => o.value === model.value))
  open.value = true
  await nextTick()
  optionEls.value[activeIndex.value]?.focus()
}

function hide(returnFocus = true) {
  open.value = false
  if (returnFocus) button.value?.focus()
}

function choose(option: DropdownOption) {
  model.value = option.value
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

<!-- Figma sort dropdown: pill, 1px border, small label + chevron; menu opens below, right-aligned -->
<template>
  <div ref="root" class="relative inline-block" @keydown.esc="hide()">
    <button
      ref="button"
      type="button"
      class="flex h-9 items-center gap-2 rounded-full border border-brown-200/60 px-4 text-xs text-muted transition-colors duration-200 hover:border-forest hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${id}-list`"
      :aria-label="`${label}: ${selected?.label}`"
      @click="open ? hide() : show()"
      @keydown.down.prevent="show()"
      @keydown.up.prevent="show()"
    >
      {{ selected?.label }}
      <Icon name="lucide:chevron-down" class="size-3.5 transition-transform duration-200" :class="{ 'rotate-180': open }" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="-translate-y-1 opacity-0"
    >
      <ul
        v-show="open"
        :id="`${id}-list`"
        role="listbox"
        :aria-label="label"
        class="absolute right-0 z-20 mt-2 min-w-full whitespace-nowrap rounded-2xl border border-line bg-paper p-1 shadow-lg shadow-black/10"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.tab="hide(false)"
      >
        <li
          v-for="(option, i) in options"
          :key="option.value"
          ref="optionEls"
          role="option"
          tabindex="-1"
          :aria-selected="option.value === model"
          class="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2 text-xs text-ink outline-none hover:bg-pale-beige focus:bg-pale-beige"
          @click="choose(option)"
          @keydown.enter.prevent="choose(option)"
          @keydown.space.prevent="choose(option)"
          @mouseenter="activeIndex = i"
        >
          {{ option.label }}
          <Icon v-if="option.value === model" name="lucide:check" class="size-3.5 text-forest" />
        </li>
      </ul>
    </Transition>
  </div>
</template>
