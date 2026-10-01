<script setup lang="ts">
const email = ref('')
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

      <!-- xl:mb-1.5 centers the 44px form on the 56px heading line -->
      <form class="flex w-full flex-col gap-2.5 sm:max-w-lg sm:flex-row xl:mb-1.5 xl:w-auto xl:max-w-none" @submit.prevent>
        <BaseInput
          v-model="email"
          type="email"
          label="Email adresa"
          placeholder="Vaša email adresa"
          input-class="h-11 border border-ink/50 bg-sun-light text-sm text-ink placeholder:text-ink/80 xl:w-[252px]"
          focus-class="focus:border-forest focus:ring-4 focus:ring-forest/20"
          class="flex-1 xl:flex-none"
        />
        <BaseButton type="submit" variant="forest" size="lg">
          Prijavite se
          <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </BaseButton>
      </form>
    </div>
  </section>
</template>
