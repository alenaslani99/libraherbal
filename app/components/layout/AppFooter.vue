<script setup lang="ts">
import { contact, footerAbout, footerLegal, footerNav, socials } from '~/data/footer'

const year = new Date().getFullYear()
const email = ref('')

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<!-- Figma "Footer Desktop": bg Main Green, full-width dividers, column titles Sora SemiBold 28px honey-500 -->
<template>
  <footer class="bg-forest text-white">
    <div class="border-b border-white/30">
      <div class="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-7 sm:px-6 lg:px-16 xl:px-[88px]">
        <AppLogo light />
        <ul class="flex items-center gap-5">
          <li v-for="social in socials" :key="social.label">
            <a
              :href="social.href"
              :aria-label="social.label"
              target="_blank"
              rel="noopener"
              class="block transition-colors duration-200 hover:text-sun"
            >
              <Icon :name="social.icon" class="size-6" />
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-b border-white/30">
      <div class="mx-auto grid max-w-[1440px] gap-10 px-4 py-9 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-16 xl:px-[88px]">
        <div>
          <h3 class="font-sans text-2xl font-semibold leading-none text-sun sm:text-[28px]">
            Informacije
          </h3>
          <p class="mt-6 text-xs leading-4 sm:max-w-[210px]">
            {{ footerAbout }}
          </p>
        </div>

        <div>
          <h3 class="font-sans text-2xl font-semibold leading-none text-sun sm:text-[28px]">
            Navigacija
          </h3>
          <!-- phones: links in 2 columns to keep the footer short -->
          <ul class="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-base sm:block sm:space-y-2">
            <li v-for="link in footerNav" :key="link.to">
              <NuxtLink :to="link.to" class="transition-colors duration-200 hover:text-sun">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="font-sans text-2xl font-semibold leading-none text-sun sm:text-[28px]">
            Kontakt
          </h3>
          <ul class="mt-5 space-y-3 text-base">
            <li>
              <a :href="`tel:${contact.phone.replace(/\s/g, '')}`" class="flex items-center gap-3 transition-colors duration-200 hover:text-sun">
                <Icon name="lucide:phone" class="size-5" />
                {{ contact.phone }}
              </a>
            </li>
            <li>
              <a :href="`mailto:${contact.email}`" class="flex items-center gap-3 transition-colors duration-200 hover:text-sun">
                <Icon name="lucide:mail" class="size-5" />
                {{ contact.email }}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="font-sans text-2xl font-semibold leading-none text-sun sm:text-[28px]">
            Newsletter
          </h3>
          <form class="mt-6 flex flex-col gap-3 sm:max-w-[280px]" @submit.prevent>
            <BaseInput
              v-model="email"
              type="email"
              label="Email adresa"
              placeholder="Vaša email adresa"
              input-class="h-10 bg-white/50 text-white placeholder:text-white"
            />
            <BaseButton type="submit" size="lg" class="w-full">
              Prijavite se
              <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </BaseButton>
          </form>
        </div>
      </div>
    </div>

    <!-- phones: arrow on top, legal links, copyright centered below · sm+: copyright | arrow | legal links -->
    <div class="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-4 py-8 text-center sm:grid sm:grid-cols-[1fr_auto_1fr] sm:py-10 sm:text-left sm:px-6 lg:px-16 xl:px-[72px]">
      <p class="order-3 text-xs sm:order-none">
        © {{ year }} LibraHerbal. Sva prava zadržana.
      </p>
      <button
        type="button"
        class="order-1 text-sun transition-transform duration-200 hover:-translate-y-1 sm:order-none"
        aria-label="Nazad na vrh"
        @click="scrollToTop"
      >
        <Icon name="lucide:chevron-up" class="size-7" />
      </button>
      <ul class="order-2 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs sm:order-none sm:justify-end">
        <li v-for="link in footerLegal" :key="link.to">
          <NuxtLink :to="link.to" class="transition-colors duration-200 hover:text-sun">
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </footer>
</template>
