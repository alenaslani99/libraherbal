<script setup lang="ts">
// Thank-you page after a successful order — reached from /placanje with ?broj=LH-2481
useSeoMeta({
  title: 'Hvala na porudžbini',
  robots: 'noindex',
})

const route = useRoute()

// only show something that looks like our order number, never arbitrary query text
const orderNumber = computed(() => {
  const value = route.query.broj
  return typeof value === 'string' && /^LH-\d{1,10}$/.test(value) ? value : null
})
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

        <BaseButton to="/" size="lg" class="mt-8 font-medium">
          Nazad na početnu
        </BaseButton>
      </div>
    </section>
    <NewsletterSection />
  </div>
</template>
