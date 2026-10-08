<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  type?: string
  placeholder?: string
  inputClass?: string
  // focus ring color — override where the default yellow would be invisible (e.g. on the yellow Newsletter CTA)
  focusClass?: string
  // marks the input invalid and shows a "!" icon; the parent renders the message and
  // switches inputClass to its invalid border, since the right color depends on the background
  error?: string
  // id of the element holding the message, for aria-describedby
  errorId?: string
  errorIconClass?: string
}>(), {
  type: 'text',
  inputClass: 'bg-paper text-ink placeholder:text-muted',
  focusClass: 'focus:ring-2 focus:ring-sun',
  errorIconClass: 'text-red-700',
})

const model = defineModel<string>()
const id = useId()
</script>

<template>
  <div class="relative">
    <label :for="id" class="sr-only">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder ?? label"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      class="w-full rounded-full px-5 py-3 text-sm transition-[background-color,border-color,box-shadow] duration-200 focus:outline-none"
      :class="[inputClass, focusClass, error ? 'pr-11' : '']"
    >
    <Icon
      v-if="error"
      name="lucide:circle-alert"
      class="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2"
      :class="errorIconClass"
      aria-hidden="true"
    />
  </div>
</template>
