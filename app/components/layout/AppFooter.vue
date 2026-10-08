<script setup lang="ts">
import { contact, footerColumns, footerLegal, socials } from '~/data/footer'

const year = new Date().getFullYear()
const { user, email, website, error, pending, done, subscribed, message, submit } = useNewsletter('footer')
const errorId = useId()

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
      <!-- phones: Informacije and Navigacija side by side, Kontakt and Newsletter full width -->
      <div class="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-4 gap-y-10 px-4 py-9 sm:gap-10 sm:px-6 lg:grid-cols-4 lg:px-16 xl:px-[88px]">
        <div v-for="column in footerColumns" :key="column.title">
          <h3 class="font-sans text-2xl font-semibold leading-none text-sun sm:text-[28px]">
            {{ column.title }}
          </h3>
          <ul class="mt-5 space-y-2 text-base">
            <li v-for="link in column.links" :key="link.to">
              <NuxtLink :to="link.to" class="transition-colors duration-200 hover:text-sun">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="col-span-2 sm:col-span-1">
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

        <div class="col-span-2 sm:col-span-1">
          <h3 class="font-sans text-2xl font-semibold leading-none text-sun sm:text-[28px]">
            Newsletter
          </h3>
          <!-- form and thank-you share one grid cell: the form stays (hidden) after sign-up so the
               footer keeps its height instead of shifting the page -->
          <div class="mt-6 grid sm:max-w-[280px]">
            <form
              v-if="!subscribed"
              class="relative flex flex-col gap-3 [grid-area:1/1]"
              :class="{ invisible: done }"
              :inert="done"
              novalidate
              @submit.prevent="submit"
            >
              <!-- signed in: one click, for the account email -->
              <p v-if="user" class="text-sm">
                Šaljemo na <strong class="break-all font-semibold">{{ user.email }}</strong>
              </p>
              <BaseInput
                v-else
                v-model="email"
                type="email"
                label="Email adresa"
                placeholder="Vaša email adresa"
                :error="error"
                :error-id="errorId"
                error-icon-class="text-sun"
                :input-class="`h-10 bg-white/50 text-white placeholder:text-white ${error ? 'ring-2 ring-sun' : ''}`"
              />
              <!-- honeypot: off-screen and skipped by keyboard and screen readers; only bots fill it -->
              <div class="absolute -left-[9999px] size-px overflow-hidden" aria-hidden="true">
                <label>Website <input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off"></label>
              </div>
              <BaseButton type="submit" size="lg" class="w-full" :disabled="pending">
                Prijavite se
                <Icon
                  :name="pending ? 'lucide:loader-circle' : 'lucide:arrow-right'"
                  class="size-4 transition-transform duration-200"
                  :class="pending ? 'animate-spin' : 'group-hover:translate-x-1'"
                />
              </BaseButton>
              <!-- out of the flow, in the footer's bottom padding: the column can be ~195px wide, where
                   a reserved line wasn't enough — longer messages wrap and pushed the button down -->
              <p :id="errorId" class="absolute left-0 top-full mt-2 px-5 text-xs leading-4 text-sun" aria-live="polite">
                {{ error }}
              </p>
            </form>

            <p class="flex items-start gap-2 self-start text-sm [grid-area:1/1]" role="status">
              <template v-if="message">
                <Icon name="lucide:circle-check" class="mt-0.5 size-4 shrink-0 text-sun" />
                {{ message }}
              </template>
            </p>
          </div>
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
