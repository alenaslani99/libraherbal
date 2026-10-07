<script setup lang="ts">
const { email, website, error, pending, done, submit } = useNewsletter('section')
</script>

<!-- Figma "Newsletter CTA": 1440 wide, hug 226px, padding 72/128, space-between, bg honey-500 -->
<template>
  <section class="bg-sun">
    <div
      class="mx-auto flex max-w-[1440px] flex-col justify-between gap-8 px-4 py-14 sm:px-6 xl:flex-row xl:items-end lg:px-16 xl:px-32 lg:py-[72px]"
    >
      <div>
        <p class="text-xs font-semibold uppercase leading-none text-ink">
          Newsletter
        </p>
        <h2 class="mt-3.5 text-[40px] leading-none text-ink sm:text-[56px]">
          Posebni saveti i ponude
        </h2>
      </div>

      <p v-if="done" class="flex items-center gap-2 text-base text-ink xl:mb-3" role="status">
        <Icon name="lucide:circle-check" class="size-5 shrink-0 text-forest" />
        Hvala! Prijavili ste se na naš newsletter.
      </p>

      <!-- xl:mb-1.5 centers the 44px form on the 56px heading line -->
      <form v-else class="relative w-full sm:max-w-lg xl:mb-1.5 xl:w-auto xl:max-w-none" novalidate @submit.prevent="submit">
        <div class="flex flex-col gap-2.5 sm:flex-row">
          <BaseInput
            v-model="email"
            type="email"
            label="Email adresa"
            placeholder="Vaša email adresa"
            input-class="h-11 border border-ink/50 bg-sun-light text-sm text-ink placeholder:text-ink/80 xl:w-[252px]"
            focus-class="focus:border-forest focus:ring-4 focus:ring-forest/20"
            class="flex-1 xl:flex-none"
          />
          <BaseButton type="submit" variant="forest" size="lg" :disabled="pending">
            Prijavite se
            <Icon
              :name="pending ? 'lucide:loader-circle' : 'lucide:arrow-right'"
              class="size-4 transition-transform duration-200"
              :class="pending ? 'animate-spin' : 'group-hover:translate-x-1'"
            />
          </BaseButton>
        </div>
        <!-- honeypot: off-screen and skipped by keyboard and screen readers; only bots fill it -->
        <div class="absolute -left-[9999px] size-px overflow-hidden" aria-hidden="true">
          <label>Website <input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off"></label>
        </div>
        <p v-if="error" class="mt-2 px-5 text-xs text-ink" role="alert">
          {{ error }}
        </p>
      </form>
    </div>
  </section>
</template>
