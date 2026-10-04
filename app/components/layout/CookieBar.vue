<script setup lang="ts">
// The site only sets essential cookies (login session; the cart lives in localStorage), which need no consent,
// so this is a notice with a single "Razumem". If analytics or marketing cookies are ever added, it needs
// Prihvati/Odbij buttons, and those scripts may only load after Prihvati.
const STORAGE_KEY = 'libraherbal:cookie-notice:v1'

// starts hidden: SSR/SSG HTML has no bar, and the browser shows it after mount if it wasn't dismissed
const visible = ref(false)

onMounted(() => {
  try {
    visible.value = !localStorage.getItem(STORAGE_KEY)
  }
  catch {
    // blocked storage — show the notice; it just can't be remembered
    visible.value = true
  }
})

function dismiss() {
  visible.value = false
  try {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
  }
  catch {
    // blocked storage — hidden for this visit only
  }
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
      aria-label="Obaveštenje o kolačićima"
      class="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div class="mx-auto flex max-w-[1180px] flex-col gap-4 rounded-2xl bg-forest px-5 py-4 text-white shadow-xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <div class="flex items-start gap-3">
          <Icon name="lucide:cookie" class="mt-0.5 size-6 shrink-0 text-sun" />
          <p class="text-sm leading-6 text-white/90">
            Koristimo samo neophodne kolačiće, za prijavu na nalog i pamćenje korpe. Ne pratimo vas i ne prikazujemo oglase.
            <NuxtLink to="/politika-privatnosti#kolacici" class="font-semibold text-sun underline underline-offset-4 hover:text-sun-hover">
              Saznajte više
            </NuxtLink>
          </p>
        </div>
        <BaseButton class="shrink-0 font-medium" @click="dismiss">
          Razumem
        </BaseButton>
      </div>
    </div>
  </Transition>
</template>
