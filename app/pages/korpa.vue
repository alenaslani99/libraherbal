<script setup lang="ts">
// SPA route (routeRules: ssr false) — the cart lives in the browser
useSeoMeta({
  title: 'Korpa',
  robots: 'noindex',
})

const { items, setQuantity, remove } = useCart()
const summary = useCartSummary()
</script>

<!-- Figma "Main": padding 64/128/96/128, gap 96 between heading and content; items left, summary card right -->
<template>
  <div>
    <section class="bg-pale-beige">
      <div class="mx-auto flex max-w-[1440px] flex-col gap-12 px-4 pt-10 pb-14 sm:px-6 lg:gap-24 lg:px-16 xl:px-32 lg:pt-16 lg:pb-24">
        <PageHeading eyebrow="Pregled stavki" title="Korpa" />

        <CartEmpty v-if="!items.length" />

        <div v-else class="grid items-start gap-10 lg:grid-cols-[minmax(0,535px)_minmax(0,450px)] lg:justify-between">
          <ul aria-label="Proizvodi u korpi">
            <li
              v-for="item in items"
              :key="item.productId"
              class="border-b border-ink/40 py-8 first:pt-0 last:border-b-0 last:pb-0 sm:py-10"
            >
              <CartItemRow
                :item="item"
                @update:quantity="setQuantity(item.productId, $event)"
                @remove="remove(item.productId)"
              />
            </li>
          </ul>

          <CartSummaryCard :summary="summary" class="lg:sticky lg:top-24" />
        </div>
      </div>
    </section>
    <NewsletterSection />
  </div>
</template>
