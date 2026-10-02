<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  placeholder?: string
  maxlength?: number
  rows?: number
  error?: string
}>(), {
  maxlength: 500,
  rows: 4,
})

const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<!-- Same look as FormField; character counter sits in the bottom-right corner of the box -->
<template>
  <div>
    <label :for="id" class="mb-1.5 block text-xs font-semibold text-ink">
      {{ label }}
    </label>
    <div class="relative">
      <textarea
        :id="id"
        v-model="model"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :rows="rows"
        :aria-invalid="!!error"
        :aria-describedby="`${id}-count ${id}-error`"
        class="block w-full resize-y rounded-md border bg-white/30 px-3.5 pt-3 pb-7 text-sm text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-brown-200 focus:outline-none focus:ring-4"
        :class="error ? 'border-red-700 focus:border-red-700 focus:ring-red-700/15' : 'border-line focus:border-forest focus:ring-forest/15'"
      />
      <span
        :id="`${id}-count`"
        class="pointer-events-none absolute right-3 bottom-2 text-[10px] tabular-nums"
        :class="model.length >= maxlength ? 'text-red-700' : 'text-brown-200'"
      >
        {{ model.length }}/{{ maxlength }}
      </span>
    </div>
    <p :id="`${id}-error`" class="mt-1 min-h-4 text-xs leading-4 text-red-700" aria-live="polite">
      {{ error }}
    </p>
  </div>
</template>
