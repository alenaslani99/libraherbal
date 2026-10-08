<script setup lang="ts">
const { email, website, error, pending, done, doneMessage, submit } = useNewsletter('section')
const errorId = useId()
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

      <!-- form and thank-you share one grid cell: the form stays (hidden) after sign-up so the
           section keeps its height instead of shifting the page. xl:mb-1.5 centers the 44px form
           on the 56px heading line -->
      <div class="grid w-full sm:max-w-lg xl:mb-1.5 xl:w-auto xl:max-w-none">
        <form
          class="relative [grid-area:1/1]"
          :class="{ invisible: done }"
          :inert="done"
          novalidate
          @submit.prevent="submit"
        >
          <div class="flex flex-col gap-2.5 sm:flex-row">
            <BaseInput
              v-model="email"
              type="email"
              label="Email adresa"
              placeholder="Vaša email adresa"
              :error="error"
              :error-id="errorId"
              :input-class="`h-11 border bg-sun-light text-sm text-ink placeholder:text-ink/80 xl:w-[252px] ${error ? 'border-red-700' : 'border-ink/50'}`"
              :focus-class="error ? 'focus:ring-4 focus:ring-red-700/15' : 'focus:border-forest focus:ring-4 focus:ring-forest/20'"
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
          <!-- out of the flow, in the section's bottom padding, so a message never moves anything -->
          <p :id="errorId" class="absolute left-0 top-full mt-2 px-5 text-xs leading-4 text-red-700" aria-live="polite">
            {{ error }}
          </p>
        </form>

        <p
          class="flex items-center gap-2 self-start text-base text-ink [grid-area:1/1] sm:self-center"
          role="status"
        >
          <template v-if="done">
            <Icon name="lucide:circle-check" class="size-5 shrink-0 text-forest" />
            {{ doneMessage }}
          </template>
        </p>
      </div>
    </div>
  </section>
</template>
