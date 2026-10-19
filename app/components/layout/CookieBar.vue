<script setup lang="ts">
// Consent bar for Google Consent Mode v2. Everything starts denied (inline script in nuxt.config, before GTM);
// GA4, Clarity and Meta Pixel only store cookies after the visitor allows them here.
// Odbij is as prominent as Prihvati sve, as the law expects.

// starts hidden: SSR/SSG HTML has no bar, and the browser shows it after mount if no choice is saved
const visible = ref(false)
const showSettings = ref(false)
const analytics = ref(false)
const marketing = ref(false)

const settingsRequest = useCookieSettingsRequest()

function open(withSettings: boolean) {
  const saved = readCookieConsent()
  analytics.value = saved?.analytics ?? false
  marketing.value = saved?.marketing ?? false
  showSettings.value = withSettings
  visible.value = true
}

onMounted(() => {
  if (!readCookieConsent()) open(false)
  // a footer click that came before this component hydrated
  if (settingsRequest.value) open(true)
})

watch(settingsRequest, () => open(true))

function choose(consent: CookieConsent) {
  saveCookieConsent(consent)
  visible.value = false
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    leave-active-class="transition duration-200 ease-in"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="visible"
      role="region"
      aria-label="Podešavanja kolačića"
      class="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div class="mx-auto max-w-[1180px] rounded-2xl bg-forest px-5 py-4 text-white shadow-xl shadow-black/20 sm:px-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div class="flex items-start gap-3">
            <Icon name="lucide:cookie" class="mt-0.5 size-6 shrink-0 text-sun" />
            <p class="text-sm leading-6 text-white/90">
              Koristimo neophodne kolačiće za rad sajta, a uz vašu saglasnost i kolačiće za analitiku i marketing,
              kako bismo poboljšali sajt i prikazali vam relevantne ponude.
              <NuxtLink to="/politika-privatnosti#kolacici" class="font-semibold text-sun underline underline-offset-4 hover:text-sun-hover">
                Saznajte više
              </NuxtLink>
            </p>
          </div>
          <div class="flex shrink-0 flex-wrap items-center gap-3">
            <button
              v-if="!showSettings"
              type="button"
              class="text-sm font-medium text-white/90 underline underline-offset-4 transition-colors hover:text-sun"
              @click="showSettings = true"
            >
              Podešavanja
            </button>
            <BaseButton variant="outline-light" class="font-medium" @click="choose({ analytics: false, marketing: false })">
              Odbij
            </BaseButton>
            <BaseButton class="font-medium" @click="choose({ analytics: true, marketing: true })">
              Prihvati sve
            </BaseButton>
          </div>
        </div>

        <div v-if="showSettings" class="mt-4 border-t border-white/15 pt-4">
          <ul class="grid gap-3 text-sm sm:grid-cols-3">
            <li class="flex items-start gap-2.5">
              <input type="checkbox" checked disabled class="mt-1 size-4 shrink-0 accent-sun opacity-60">
              <span>
                <span class="font-semibold">Neophodni</span>
                <span class="block text-white/70">Prijava na nalog i korpa. Uvek uključeni.</span>
              </span>
            </li>
            <li>
              <label class="flex cursor-pointer items-start gap-2.5">
                <input v-model="analytics" type="checkbox" class="mt-1 size-4 shrink-0 cursor-pointer accent-sun">
                <span>
                  <span class="font-semibold">Analitika</span>
                  <span class="block text-white/70">Google Analytics i Microsoft Clarity: kako se sajt koristi.</span>
                </span>
              </label>
            </li>
            <li>
              <label class="flex cursor-pointer items-start gap-2.5">
                <input v-model="marketing" type="checkbox" class="mt-1 size-4 shrink-0 cursor-pointer accent-sun">
                <span>
                  <span class="font-semibold">Marketing</span>
                  <span class="block text-white/70">Meta Pixel: merenje i prikaz oglasa na Facebooku i Instagramu.</span>
                </span>
              </label>
            </li>
          </ul>
          <div class="mt-4 flex justify-end">
            <BaseButton variant="outline-light" class="font-medium" @click="choose({ analytics, marketing })">
              Sačuvaj izbor
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
