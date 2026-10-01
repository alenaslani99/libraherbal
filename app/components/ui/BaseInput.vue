<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  type?: string
  placeholder?: string
  inputClass?: string
  // focus ring color — override where the default yellow would be invisible (e.g. on the yellow Newsletter CTA)
  focusClass?: string
}>(), {
  type: 'text',
  inputClass: 'bg-paper text-ink placeholder:text-muted',
  focusClass: 'focus:ring-2 focus:ring-sun',
})

const model = defineModel<string>()
const id = useId()
</script>

<template>
  <div>
    <label :for="id" class="sr-only">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder ?? label"
      class="w-full rounded-full px-5 py-3 text-sm transition-[background-color,border-color,box-shadow] duration-200 focus:outline-none"
      :class="[inputClass, focusClass]"
    >
  </div>
</template>
