<script setup lang="ts">
import type { OrderRequest, PaymentMethod, ShippingDetails } from '#shared/types/order'

// SPA route (routeRules: ssr false) — needs the browser cart
useSeoMeta({
  title: 'Plaćanje',
  robots: 'noindex',
})

const { items } = useCart()
const summary = useCartSummary()

const paymentMethods: { value: PaymentMethod, title: string, description: string }[] = [
  { value: 'pouzece', title: 'Plaćanje pouzećem', description: 'Platite kuriru prilikom preuzimanja.' },
]

const shipping = reactive<ShippingDetails>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  address: '',
  postalCode: '',
  note: '',
})
const paymentMethod = ref<PaymentMethod>('pouzece')
const errors = reactive<Partial<Record<keyof ShippingDetails, string>>>({})
const notice = ref('')

// a field's message disappears as soon as the customer edits it
for (const key of Object.keys(shipping) as (keyof ShippingDetails)[]) {
  watch(() => shipping[key], () => {
    errors[key] = ''
  })
}

function validate() {
  errors.firstName = shipping.firstName.trim() ? '' : 'Unesite ime.'
  errors.lastName = shipping.lastName.trim() ? '' : 'Unesite prezime.'
  errors.email = /^\S+@\S+\.\S+$/.test(shipping.email) ? '' : 'Unesite ispravnu email adresu.'
  errors.phone = /^[+\d][\d\s/-]{5,}$/.test(shipping.phone.trim()) ? '' : 'Unesite ispravan broj telefona.'
  errors.city = shipping.city.trim() ? '' : 'Unesite grad.'
  errors.address = shipping.address.trim() ? '' : 'Unesite adresu za dostavu.'
  errors.postalCode = /^\d{5}$/.test(shipping.postalCode.trim()) ? '' : 'Poštanski broj ima 5 cifara.'
  errors.note = shipping.note.length <= 500 ? '' : 'Napomena može imati najviše 500 karaktera.'
  return Object.values(errors).every(e => !e)
}

const { placeOrder, pending } = usePlaceOrder()

async function onSubmit() {
  notice.value = ''
  if (pending.value || !validate()) return

  const order: OrderRequest = {
    shipping: { ...shipping },
    paymentMethod: paymentMethod.value,
    items: items.value.map(({ productId, quantity }) => ({ productId, quantity })),
  }

  try {
    await placeOrder(order)
  }
  catch {
    notice.value = 'Porudžbina nije poslata. Proverite internet vezu i pokušajte ponovo.'
  }
}
</script>

<!-- Figma "Main": padding 72/128/96/128, gap 72; form left (~626), cart summary right (~436) -->
<template>
  <div>
    <section class="bg-pale-beige">
      <div class="mx-auto flex max-w-[1440px] flex-col gap-12 px-4 pt-10 pb-14 sm:px-6 lg:gap-[72px] lg:px-16 xl:px-32 lg:pt-[72px] lg:pb-24">
        <PageHeading eyebrow="Završetak porudžbine" title="Još samo" title-italic="jedan korak." />

        <CartEmpty v-if="!items.length" />

        <div v-else class="grid items-start gap-10 lg:grid-cols-[minmax(0,626px)_minmax(0,436px)] lg:justify-between">
          <form novalidate @submit.prevent="onSubmit">
            <ShippingForm v-model="shipping" :errors="errors" />

            <fieldset class="mt-10">
              <legend class="font-heading text-2xl font-semibold leading-tight text-ink">
                Način plaćanja
              </legend>
              <div class="mt-5 space-y-3">
                <PaymentMethodOption
                  v-for="method in paymentMethods"
                  :key="method.value"
                  v-model="paymentMethod"
                  v-bind="method"
                />
              </div>
            </fieldset>

            <p v-if="notice" class="mt-6 rounded-md border border-sun bg-sun-light/60 px-4 py-3 text-sm text-ink" role="status">
              {{ notice }}
            </p>

            <BaseButton type="submit" size="lg" class="mt-10 w-full font-medium" :disabled="pending" :aria-busy="pending">
              <template v-if="pending">
                Šaljemo porudžbinu…
              </template>
              <template v-else>
                Nastavi na plaćanje
                <Icon name="lucide:lock" class="size-4" />
              </template>
            </BaseButton>
          </form>

          <CartSummaryCard :summary="summary" :items="items" :show-checkout="false" class="lg:sticky lg:top-24" />
        </div>
      </div>
    </section>
    <NewsletterSection />
  </div>
</template>
