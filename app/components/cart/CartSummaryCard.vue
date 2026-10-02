<script setup lang="ts">
import type { CartItem, CartSummary } from '#shared/types/cart'

withDefaults(defineProps<{
  summary: CartSummary
  // /placanje passes the items so the customer sees what they're ordering
  items?: CartItem[]
  // hidden on /placanje, where the form has its own submit button
  showCheckout?: boolean
}>(), {
  items: () => [],
  showCheckout: true,
})
</script>

<!-- Figma "Vaša korpa": Main Green card, radius 24, free-shipping bar, totals, yellow checkout button -->
<template>
  <aside class="rounded-3xl bg-forest px-6 pt-7 pb-8 text-white sm:px-8" aria-labelledby="cart-summary-title">
    <div class="flex items-center justify-between gap-4">
      <h2 id="cart-summary-title" class="font-sans text-xs font-medium uppercase leading-none">
        Vaša korpa
      </h2>
      <NuxtLink v-if="items.length" to="/korpa" class="text-[11px] leading-none text-white/80 underline underline-offset-4 transition-colors hover:text-sun">
        Izmeni
      </NuxtLink>
    </div>

    <!-- checkout: what is being ordered -->
    <ul v-if="items.length" class="mt-5 space-y-3 border-b border-white/20 pb-5" aria-label="Proizvodi u porudžbini">
      <li v-for="item in items" :key="item.variantId" class="flex items-center gap-3">
        <div class="relative shrink-0">
          <NuxtImg :src="item.image" alt="" width="48" height="48" format="webp" sizes="xs:48px sm:48px md:48px lg:48px" class="size-12 rounded-lg object-cover" />
          <span class="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sun px-1 text-[10px] font-bold leading-none text-ink">
            {{ item.quantity }}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate font-heading text-sm font-semibold leading-5">
            {{ item.name }}
          </p>
          <p class="text-[11px] leading-4 text-white/70">
            {{ item.variantLabel }} · {{ item.quantity }} × {{ item.price }} RSD
          </p>
        </div>
      </li>
    </ul>

    <div
      class="mt-4 h-1 overflow-hidden rounded-full bg-white/70"
      role="progressbar"
      aria-label="Napredak do besplatne dostave"
      :aria-valuenow="Math.round(summary.freeShippingProgress * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="h-full rounded-full bg-sun transition-[width] duration-500 ease-out" :style="{ width: `${summary.freeShippingProgress * 100}%` }" />
    </div>
    <p class="mt-3 text-[11px] leading-4">
      <template v-if="summary.remainingForFreeShipping">
        Još <strong class="font-semibold">{{ summary.remainingForFreeShipping }} RSD</strong> do besplatne dostave
      </template>
      <template v-else>
        <strong class="font-semibold text-sun">Ostvarili ste besplatnu dostavu!</strong>
      </template>
    </p>

    <dl class="mt-5 space-y-2 text-xs">
      <div class="flex justify-between gap-4">
        <dt>Proizvodi ({{ summary.itemCount }})</dt>
        <dd>{{ summary.subtotal }} <span class="text-[9px]">RSD</span></dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt>Dostava</dt>
        <dd v-if="summary.shipping">
          {{ summary.shipping }} <span class="text-[9px]">RSD</span>
        </dd>
        <dd v-else class="text-sun">
          Besplatno
        </dd>
      </div>
    </dl>

    <div class="mt-6 flex justify-between gap-4 border-t border-white/30 pt-6 text-sm font-semibold">
      <span>Ukupno</span>
      <span>{{ summary.total }} <span class="text-[10px]">RSD</span></span>
    </div>

    <!-- checkout: what happens next -->
    <ul v-if="items.length" class="mt-6 space-y-3 rounded-2xl bg-white/5 p-4 text-[11px] leading-4 text-white/85">
      <li class="flex gap-3">
        <Icon name="lucide:truck" class="size-4 shrink-0 text-sun" />
        <span><strong class="font-semibold text-white">Isporuka za 1–3 radna dana</strong> na adresu širom Srbije.</span>
      </li>
      <li class="flex gap-3">
        <Icon name="lucide:banknote" class="size-4 shrink-0 text-sun" />
        <span><strong class="font-semibold text-white">Plaćanje pouzećem</strong> — plaćate kuriru gotovinom kada preuzmete paket.</span>
      </li>
      <li class="flex gap-3">
        <Icon name="lucide:mail-check" class="size-4 shrink-0 text-sun" />
        <span><strong class="font-semibold text-white">Potvrda na email</strong> stiže odmah nakon porudžbine.</span>
      </li>
    </ul>

    <div v-if="showCheckout" class="mt-6 flex justify-center">
      <BaseButton to="/placanje" size="sm" class="w-full max-w-[300px] font-medium">
        Nastavi na plaćanje
        <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-1" />
      </BaseButton>
    </div>
  </aside>
</template>
