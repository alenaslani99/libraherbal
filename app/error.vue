<script setup lang="ts">
import type { NuxtError } from '#app'

// One page for every error (404, 429, 500…): same Figma "Main" layout, only icon and text change.
const props = defineProps<{ error: NuxtError }>()

const messages: Record<number, { icon: string, title: string, text: string }> = {
  404: {
    icon: 'lucide:frown',
    title: 'Stranica nije pronađena',
    text: 'Stranica koju tražite ne postoji ili je premeštena.',
  },
  429: {
    icon: 'lucide:hourglass',
    title: 'Previše zahteva',
    text: 'Poslali ste previše zahteva za kratko vreme. Sačekajte minut, pa pokušajte ponovo.',
  },
}
const fallback = {
  icon: 'lucide:frown',
  title: 'Nešto nije u redu',
  text: 'Došlo je do greške na našoj strani. Pokušajte ponovo za nekoliko trenutaka.',
}

const status = computed(() => props.error.statusCode || 500)
const message = computed(() => messages[status.value] ?? fallback)

useSeoMeta({
  title: () => message.value.title,
  robots: 'noindex',
})

// clearError leaves the error state; a plain link would keep showing this page
function goHome() {
  clearError({ redirect: '/' })
}
</script>

<!-- Figma "Main": padding 72/553 (narrow centered column), gap 64, centered content, pale beige -->
<template>
  <!-- always the shop layout: /admin sets layout: false, and its 404 must look like any other -->
  <NuxtLayout name="default">
    <section class="bg-pale-beige">
      <div class="mx-auto flex max-w-[600px] flex-col items-center px-4 py-16 text-center sm:px-6 lg:py-[72px]">
        <div class="flex size-20 items-center justify-center rounded-full bg-sun text-ink">
          <Icon :name="message.icon" class="size-10" />
        </div>

        <h1 class="mt-16 text-[64px] leading-none tracking-[-0.02em] text-ink sm:text-[80px]">
          {{ status }}
        </h1>

        <div class="mt-16 text-ink">
          <p class="text-sm font-medium leading-5">
            {{ message.title }}
          </p>
          <p class="mt-1 text-xs leading-4">
            {{ message.text }}
          </p>
        </div>

        <BaseButton size="lg" class="mt-8 font-medium" @click="goHome">
          <Icon name="lucide:arrow-left" class="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
          Nazad na početnu
        </BaseButton>
      </div>
    </section>
  </NuxtLayout>
</template>
