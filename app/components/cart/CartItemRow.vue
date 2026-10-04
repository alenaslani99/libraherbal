<script setup lang="ts">
import type { CartItem } from '#shared/types/cart'
import { CART_MAX_QUANTITY } from '~/composables/useCart'

const props = defineProps<{ item: CartItem }>()
const emit = defineEmits<{
  'update:quantity': [quantity: number]
  'remove': []
}>()

const quantity = computed({
  get: () => props.item.quantity,
  set: value => emit('update:quantity', value),
})
</script>

<!-- Figma cart item: 136px square photo, Fraunces name, size, price, stepper; trash icon top right -->
<template>
  <article class="flex gap-5 sm:gap-7">
    <NuxtLink :to="`/proizvodi/${item.slug}`" class="shrink-0" tabindex="-1" aria-hidden="true">
      <NuxtImg
        :src="item.image"
        alt=""
        width="136"
        height="136"
        format="webp"
        sizes="xs:96px sm:136px md:136px lg:136px"
        class="size-24 rounded-xl object-cover sm:size-[136px]"
      />
    </NuxtLink>

    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h2 class="font-heading text-xl font-semibold leading-6 text-ink">
            <NuxtLink :to="`/proizvodi/${item.slug}`" class="hover:text-forest">
              {{ item.name }}
            </NuxtLink>
          </h2>
          <p class="text-xs text-ink">
            {{ item.weight }}
          </p>
        </div>
        <button
          type="button"
          class="-m-1 shrink-0 rounded-md p-1 text-ink transition-colors duration-200 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-sun"
          :aria-label="`Ukloni ${item.name} iz korpe`"
          @click="emit('remove')"
        >
          <Icon name="lucide:trash-2" class="size-5" />
        </button>
      </div>

      <p class="mt-3 text-sm font-semibold leading-none text-ink">
        {{ item.price }},00 <span class="text-[10px]">RSD</span>
      </p>
      <QuantityStepper v-model="quantity" :max="CART_MAX_QUANTITY" class="mt-4 self-start" />
    </div>
  </article>
</template>
