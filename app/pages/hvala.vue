<script setup lang="ts">
// Thank-you page after a successful order — the order-placed middleware lets only a just-placed order in
definePageMeta({ middleware: 'order-placed' })
useSeoMeta({
  title: 'Hvala na porudžbini',
  robots: 'noindex',
})

// the middleware already checked it against ORDER_NUMBER_PATTERN
const orderNumber = useLastOrder()
</script>

<!-- Figma "Main": padding 72/553 (narrow centered column), gap 64, centered content -->
<template>
  <div>
    <section class="bg-pale-beige">
      <div class="mx-auto flex max-w-[600px] flex-col items-center px-4 py-16 text-center sm:px-6 lg:py-[72px]">
        <div class="flex size-20 items-center justify-center rounded-full bg-sun text-ink">
          <Icon name="lucide:check" class="size-8" />
        </div>
        <p class="mt-6 text-xs uppercase leading-none tracking-[0.04em] text-brown-200">
          Porudžbina primljena
        </p>

        <h1 class="mt-16 text-[44px] leading-none tracking-[-0.02em] text-ink sm:text-[56px] lg:text-[64px]">
          <span class="block">Hvala na</span>
          <em class="block">poverenju.</em>
        </h1>

        <p class="mt-10 text-sm leading-5 text-ink">
          <template v-if="orderNumber">
            Vaša porudžbina <strong class="font-semibold">#{{ orderNumber }}</strong> je zabeležena.
          </template>
          <template v-else>
            Vaša porudžbina je zabeležena.
          </template>
          <br>
          Poslali smo potvrdu na vašu email adresu.
        </p>
        <p class="mt-4 flex items-center gap-2 text-xs text-ink">
          <Icon name="lucide:truck" class="size-4" />
          Isporuka za 1–3 radna dana
        </p>

        <BaseButton
          :to="`/prati-porudzbinu?broj=${encodeURIComponent(orderNumber ?? '')}`"
          size="lg"
          class="mt-8 font-medium"
        >
          Prati porudžbinu
          <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </BaseButton>
        <NuxtLink to="/" class="mt-4 text-sm text-ink underline underline-offset-4 transition-colors hover:text-forest">
          Nazad na početnu
        </NuxtLink>
      </div>
    </section>
    <NewsletterSection />
  </div>
</template>
