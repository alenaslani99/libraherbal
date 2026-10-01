<script setup lang="ts">
defineProps<{ error?: string }>()

const model = defineModel<boolean>({ default: false })
const id = useId()
</script>

<template>
  <div>
    <label :for="id" class="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
      <input
        :id="id"
        v-model="model"
        type="checkbox"
        class="mt-0.5 size-4 shrink-0 cursor-pointer rounded-sm border-brown-200 accent-forest"
      >
      <span><slot /></span>
    </label>
    <p v-if="error" class="mt-1.5 text-xs text-red-700">
      {{ error }}
    </p>
  </div>
</template>
