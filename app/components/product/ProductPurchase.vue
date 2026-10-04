<script setup lang="ts">
const props = defineProps<{
  // RSD, e.g. 1490
  price: number
  // "500g", "3 kom"
  weight: string
  inStock: boolean
  // promotion: price before the discount (RSD) and when it ends (ISO, UTC)
  regularPrice?: number
  saleEndsAt?: string | null
}>()

const emit = defineEmits<{ add: [quantity: number] }>()

const quantity = ref(1)

const discount = computed(() => (props.regularPrice ? Math.round((1 - props.price / props.regularPrice) * 100) : 0))

// "10. 10. 2026." in Serbian time (fixed time zone, so server and browser render the same text)
const saleEnds = computed(() => props.regularPrice && props.saleEndsAt
  ? new Date(props.saleEndsAt).toLocaleDateString('sr-Latn-RS', { timeZone: 'Europe/Belgrade' })
  : '')

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

<!-- Figma: stock line, big price (+ old price and "-N%" pill on promotion), pack size, quantity stepper + yellow "Dodaj u korpu" -->
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
    <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
      <p class="text-[40px] font-semibold leading-none tracking-[-0.02em] text-ink">
        <span v-if="discount" class="sr-only">Akcijska cena: </span>{{ price }},00 <span class="text-xl">RSD</span>
      </p>
      <template v-if="discount">
        <p class="text-lg leading-none text-brown-200">
          <span class="sr-only">Stara cena: </span><del>{{ regularPrice }},00 RSD</del>
        </p>
        <span class="rounded-full bg-sun px-3 py-1.5 text-xs font-semibold leading-none text-ink">
          -{{ discount }}%<span class="sr-only"> popusta</span>
        </span>
      </template>
    </div>
    <p v-if="saleEnds" class="mt-3 flex items-center gap-2 text-xs text-ink">
      <Icon name="lucide:clock" class="size-4 text-sun-dark" />
      Akcija traje do {{ saleEnds }}
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
