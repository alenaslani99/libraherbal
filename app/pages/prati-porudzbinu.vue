<script setup lang="ts">
import type { OrderTracking } from '#shared/types/order'

usePageSeo({
  title: 'Prati porudžbinu',
  description: 'Unesite broj porudžbine i pogledajte gde je vaša Libra Herbal porudžbina: primljena, u pripremi, u transportu ili isporučena.',
})

const route = useRoute()
const router = useRouter()

// ?broj= (from /hvala or a shared link) fills the field and searches right away
const query = ref(typeof route.query.broj === 'string' ? route.query.broj : '')
const order = ref<OrderTracking | null>(null)
const error = ref('')
const pending = ref(false)

async function search() {
  error.value = ''
  if (pending.value) return
  const orderNumber = normalizeOrderNumber(query.value)
  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) {
    order.value = null
    error.value = 'Unesite broj porudžbine u formatu LH-2026-12345678.'
    return
  }

  query.value = orderNumber
  // keeps the number in the URL, so a refresh or shared link shows the same order
  if (route.query.broj !== orderNumber) router.replace({ query: { broj: orderNumber } })

  pending.value = true
  try {
    order.value = await $fetch<OrderTracking>('/api/orders/track', { query: { broj: orderNumber } })
  }
  catch (e) {
    order.value = null
    error.value = apiError(e).message
  }
  finally {
    pending.value = false
  }
}

// looked up in the browser only: the order isn't part of the page Google sees
onMounted(() => {
  if (query.value) search()
})
</script>

<template>
  <div>
    <section class="bg-forest">
      <div class="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-16 lg:py-[72px] xl:px-32">
        <PageHeading eyebrow="Porudžbina" title="Prati" title-italic="porudžbinu." light />
        <p class="mt-6 max-w-[520px] text-sm font-light text-white">
          Unesite broj porudžbine iz potvrde koju ste dobili i pogledajte gde se vaša porudžbina nalazi.
        </p>

        <form class="mt-8 flex max-w-[560px] flex-col gap-3 sm:flex-row" novalidate @submit.prevent="search">
          <BaseInput
            v-model="query"
            label="Broj porudžbine"
            placeholder="npr. LH-2026-12345678"
            class="flex-1"
            input-class="h-11 bg-white text-ink placeholder:text-muted"
          />
          <BaseButton type="submit" size="lg" class="font-medium" :disabled="pending" :aria-busy="pending">
            {{ pending ? 'Tražimo…' : 'Prati' }}
            <Icon v-if="!pending" name="lucide:search" class="size-4" />
          </BaseButton>
        </form>
      </div>
    </section>

    <section class="bg-pale-beige">
      <div class="mx-auto max-w-[680px] px-4 py-12 sm:px-6 lg:py-[72px]">
        <p v-if="error" class="flex items-start gap-3 rounded-xl border border-sun bg-sun-light/60 px-4 py-3 text-sm text-ink" role="alert">
          <Icon name="lucide:circle-alert" class="mt-0.5 size-4 shrink-0 text-sun-dark" />
          {{ error }}
        </p>

        <div aria-live="polite">
          <OrderTrackingCard v-if="order" :order="order" />
        </div>

        <div v-if="!order && !error" class="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <Icon :name="pending ? 'lucide:loader-circle' : 'lucide:package-search'" class="size-10 text-brown-200" :class="{ 'animate-spin': pending }" />
          <p class="mt-4 max-w-[360px] text-sm text-muted">
            {{ pending ? 'Tražimo vašu porudžbinu…' : 'Broj porudžbine se nalazi u potvrdi porudžbine i na stranici zahvalnosti posle kupovine.' }}
          </p>
        </div>

        <p class="mt-8 text-center text-sm text-muted">
          Imate pitanje o porudžbini?
          <NuxtLink to="/kontakt" class="font-semibold text-forest underline underline-offset-4 hover:text-sun-dark">
            Kontaktirajte nas
          </NuxtLink>
        </p>
      </div>
    </section>

    <NewsletterSection />
  </div>
</template>
