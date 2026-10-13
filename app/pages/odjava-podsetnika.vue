<script setup lang="ts">
// Landing page of the "Odjavite se od podsetnika" link in reminder emails. Unsubscribing takes a click
// (POST), so email link scanners that open the page don't unsubscribe anyone.
useSeoMeta({
  title: 'Odjava od podsetnika',
  robots: 'noindex',
})

const route = useRoute()
const token = computed(() => {
  const t = route.query.t
  return typeof t === 'string' && /^[0-9a-f]{64}$/.test(t) ? t : null
})

const state = ref<'idle' | 'pending' | 'done' | 'error'>('idle')

async function unsubscribe() {
  if (!token.value) return
  state.value = 'pending'
  try {
    await $fetch('/api/email/unsubscribe', { method: 'POST', query: { t: token.value } })
    state.value = 'done'
  }
  catch {
    state.value = 'error'
  }
}
</script>

<template>
  <div>
    <section class="bg-pale-beige">
      <div class="mx-auto flex max-w-[600px] flex-col items-center px-4 py-16 text-center sm:px-6 lg:py-[72px]">
        <div class="flex size-20 items-center justify-center rounded-full bg-sun text-ink">
          <Icon :name="state === 'done' ? 'lucide:check' : 'lucide:mail-x'" class="size-8" />
        </div>
        <p class="mt-6 text-xs uppercase leading-none tracking-[0.04em] text-brown-200">
          Podsetnici
        </p>

        <h1 class="mt-10 text-[40px] leading-none tracking-[-0.02em] text-ink sm:text-[48px]">
          <template v-if="state === 'done'">
            Odjavljeni ste.
          </template>
          <template v-else>
            Odjava od podsetnika
          </template>
        </h1>

        <p v-if="!token" class="mt-8 text-sm leading-5 text-ink">
          Link za odjavu nije ispravan. Otvorite ga ponovo iz emaila ili nam pišite putem
          <NuxtLink to="/kontakt" class="underline underline-offset-4 hover:text-forest">kontakt forme</NuxtLink>.
        </p>
        <p v-else-if="state === 'done'" class="mt-8 text-sm leading-5 text-ink">
          Više vam nećemo slati podsetnike o korpi i pregledanim proizvodima.
        </p>
        <template v-else>
          <p class="mt-8 text-sm leading-5 text-ink">
            Povremeno vam šaljemo podsetnik kada ostavite proizvode u korpi ili pogledate proizvod bez poručivanja.
            Ako ih ne želite, odjavite se jednim klikom.
          </p>
          <BaseButton size="lg" class="mt-8 font-medium" :disabled="state === 'pending'" @click="unsubscribe">
            Odjavi me od podsetnika
          </BaseButton>
          <p v-if="state === 'error'" class="mt-4 text-sm text-red-700">
            Odjava trenutno nije uspela. Pokušajte ponovo za nekoliko trenutaka.
          </p>
        </template>

        <NuxtLink to="/" class="mt-6 text-sm text-ink underline underline-offset-4 transition-colors hover:text-forest">
          Nazad na početnu
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
