<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  type?: string
  placeholder?: string
  autocomplete?: string
  required?: boolean
  error?: string
}>(), {
  type: 'text',
  required: false,
})

const model = defineModel<string>({ default: '' })
const id = useId()
const showPassword = ref(false)

const inputType = computed(() =>
  props.type === 'password' && showPassword.value ? 'text' : props.type,
)
</script>

<!-- Form field styled after the Figma checkout form: small bold label, light input with thin border -->
<template>
  <div>
    <label :for="id" class="mb-1.5 block text-xs font-semibold text-ink">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${id}-error` : undefined"
        class="h-11 w-full rounded-md border bg-white/30 px-3.5 text-sm text-ink transition-[border-color,box-shadow] duration-200 placeholder:text-brown-200 focus:border-forest focus:outline-none focus:ring-4 focus:ring-forest/15"
        :class="[error ? 'border-red-700' : 'border-line', type === 'password' ? 'pr-11' : '']"
      >
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-brown-200 transition-colors hover:text-ink"
        :aria-label="showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'"
        @click="showPassword = !showPassword"
      >
        <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="size-4" />
      </button>
    </div>
    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-xs text-red-700">
      {{ error }}
    </p>
  </div>
</template>
