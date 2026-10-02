<script setup lang="ts">
import type { ProductVariant } from '#shared/types/product'

const props = defineProps<{
  variants: ProductVariant[]
  defaultVariantId: number
}>()

const emit = defineEmits<{ add: [payload: { variantId: number, quantity: number }] }>()

const variantId = ref(props.defaultVariantId)
const quantity = ref(1)
const variant = computed(() => props.variants.find(v => v.id === variantId.value) ?? props.variants[0]!)

const added = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function addToCart() {
  emit('add', { variantId: variant.value.id, quantity: quantity.value })
  added.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (added.value = false), 1500)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<!-- Figma: stock line, big price, size chips, quantity stepper + yellow "Dodaj u korpu" -->
<template>
  <div>
    <!-- static icon names: the icon bundle is built by scanning source for literal "lucide:*" strings -->
    <p v-if="variant.inStock" class="flex items-center gap-2 text-xs text-ink">
      <Icon name="lucide:check" class="size-4 text-sun-dark" />
      Na stanju
    </p>
    <p v-else class="flex items-center gap-2 text-xs text-red-700">
      <Icon name="lucide:x" class="size-4 text-red-700" />
      Trenutno nema na stanju
    </p>
    <p class="mt-2 text-[40px] font-semibold leading-none tracking-[-0.02em] text-ink">
      {{ variant.price }} <span class="text-xl">RSD</span>
    </p>

    <VariantPicker v-if="variants.length > 1" v-model="variantId" :variants="variants" class="mt-7" />

    <div class="mt-6 flex items-center gap-4 sm:gap-8">
      <QuantityStepper v-model="quantity" :disabled="!variant.inStock" />
      <BaseButton
        size="sm"
        class="flex-1 font-medium sm:max-w-[246px]"
        :disabled="!variant.inStock"
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
