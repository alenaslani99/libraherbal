<script setup lang="ts">
const props = defineProps<{ productName: string }>()
const emit = defineEmits<{ add: [] }>()

const added = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function onClick() {
  emit('add')
  added.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    added.value = false
  }, 1500)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<!-- Plus button; on click the pill grows to the left with "Dodato", then closes -->
<template>
  <button
    type="button"
    class="relative z-10 inline-flex h-6 items-center rounded-full bg-forest text-sun transition-transform duration-200 hover:scale-110"
    :aria-label="`Dodaj ${props.productName} u korpu`"
    @click="onClick"
  >
    <span
      class="overflow-hidden whitespace-nowrap text-xs font-medium leading-none transition-[max-width,padding] duration-300 ease-out"
      :class="added ? 'max-w-20 pl-3' : 'max-w-0 pl-0'"
      aria-hidden="true"
    >
      Dodato
    </span>
    <span class="flex size-6 items-center justify-center">
      <Icon :name="added ? 'lucide:check' : 'lucide:plus'" class="size-4" />
    </span>
    <span class="sr-only" aria-live="polite">{{ added ? `${props.productName} dodat u korpu` : '' }}</span>
  </button>
</template>
