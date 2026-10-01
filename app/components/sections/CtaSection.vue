<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  text?: string
  buttonLabel: string
  to: string
  images?: [string, string]
}>(), {
  images: () => ['/assets/img/med-kopriva.jpg', '/assets/img/uro-balans.jpg'],
})
</script>

<!-- Figma blog CTA: bg Main Green, padding 72/128, text left, two bottom-aligned images right -->
<template>
  <section class="bg-forest">
    <div class="mx-auto flex max-w-[1440px] flex-col gap-12 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-16 xl:px-32 lg:py-[72px]">
      <div class="max-w-[460px] lg:flex-1">
        <p v-if="eyebrow" class="text-xs uppercase leading-none text-sun">
          {{ eyebrow }}
        </p>
        <h2 class="mt-4 max-w-[440px] text-[40px] font-medium leading-none tracking-[-0.02em] text-white sm:text-[56px]">
          {{ title }}
        </h2>
        <p v-if="text" class="mt-7 max-w-[354px] text-base font-light leading-5 text-white">
          {{ text }}
        </p>
        <BaseButton :to="to" size="lg" class="mt-10">
          {{ buttonLabel }}
          <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </BaseButton>
      </div>

      <!-- fluid image pair: 314 + 8 + 265 = 587px at full size -->
      <div class="flex w-full max-w-[587px] shrink-0 items-end gap-2 lg:w-[52%]">
        <NuxtImg
          :src="images[0]"
          alt=""
          width="314"
          height="392"
          format="webp"
          sizes="xs:55vw sm:55vw md:320px lg:320px"
          loading="lazy"
          class="aspect-[314/392] min-w-0 flex-[314] rounded-xl object-cover"
        />
        <NuxtImg
          :src="images[1]"
          alt=""
          width="265"
          height="353"
          format="webp"
          sizes="xs:45vw sm:45vw md:270px lg:270px"
          loading="lazy"
          class="aspect-[265/353] min-w-0 flex-[265] rounded-xl object-cover"
        />
      </div>
    </div>
  </section>
</template>
