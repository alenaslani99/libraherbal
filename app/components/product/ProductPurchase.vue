<script setup lang="ts">
defineProps<{
  // RSD, e.g. 1490
  price: number
  // "500g", "3 kom"
  weight: string
  inStock: boolean
}>()

const emit = defineEmits<{ add: [quantity: number] }>()

const quantity = ref(1)

const added = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function addToCart() {
  emit('add', quantity.value)
  added.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (added.value = false), 1500)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<!-- Figma: stock line, big price, pack size, quantity stepper + yellow "Dodaj u korpu" -->
<template>
  <div>
    <!-- static icon names: the icon bundle is built by scanning source for literal "lucide:*" strings -->
    <p v-if="inStock" class="flex items-center gap-2 text-xs text-ink">
      <Icon name="lucide:check" class="size-4 text-sun-dark" />
      Na stanju
    </p>
    <p v-else class="flex items-center gap-2 text-xs text-red-700">
      <Icon name="lucide:x" class="size-4 text-red-700" />
      Trenutno nema na stanju
    </p>
    <p class="mt-2 text-[40px] font-semibold leading-none tracking-[-0.02em] text-ink">
      {{ price }},00 <span class="text-xl">RSD</span>
    </p>

    <p v-if="weight" class="mt-3 text-sm text-ink">
      Pakovanje: {{ weight }}
    </p>

    <div class="mt-6 flex items-center gap-4 sm:gap-8">
      <QuantityStepper v-model="quantity" :disabled="!inStock" />
      <BaseButton
        size="sm"
        class="flex-1 font-medium sm:max-w-[246px]"
        :disabled="!inStock"
        @click="addToCart"
      >
        <template v-if="added">
          <Icon name="lucide:check" class="size-4" />
          Dodato u korpu
        </template>
        <template v-else>
          Dodaj u korpu
        </template>
      </BaseButton>
      <span class="sr-only" aria-live="polite">{{ added ? 'Proizvod je dodat u korpu' : '' }}</span>
    </div>
  </div>
</template>
