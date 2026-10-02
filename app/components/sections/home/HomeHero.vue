<template>
  <section class="relative isolate overflow-hidden bg-forest-dark">
    <NuxtImg
      src="/assets/img/hero.jpg"
      alt=""
      width="1536"
      height="1024"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
      format="webp"
      preload
      fetchpriority="high"
      class="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]"
    />
    <!-- Figma: two linear gradients — black from the left (text contrast), main green from the bottom (blends into Specs Bar) -->
    <div class="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
    <div class="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-forest/70 to-transparent" />
    <!-- below lg the text sits over the jar, so darken the whole photo a bit -->
    <div class="absolute inset-0 -z-10 bg-black/35 lg:hidden" />

    <div class="mx-auto flex min-h-[560px] max-w-[1440px] items-center px-4 py-16 sm:py-20 sm:px-6 lg:min-h-[660px] lg:px-16 xl:px-32">
      <div class="w-full sm:w-auto">
        <h1 class="text-[44px] leading-none tracking-[-0.02em] text-white sm:text-[60px] sm:whitespace-nowrap lg:text-[72px]">
          <span class="block">Prirodno rešenje</span>
          <em class="block text-sun">vaših problema.</em>
        </h1>
        <p class="mt-7 max-w-[354px] text-base font-light leading-[18px] text-white">
          Domaći medovi, čajevi i melemi za rešavanje akutnih i hroničnih problema.
        </p>

        <div class="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row lg:mt-16">
          <BaseButton to="/proizvodi" size="lg" class="font-medium">
            Istražite proizvode
            <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-1" />
          </BaseButton>
          <BaseButton to="/o-nama" variant="outline-light" size="lg">
            Naša priča
          </BaseButton>
        </div>

        <div class="mt-8 flex items-center gap-4 text-white sm:mt-6 sm:gap-6">
          <div class="flex items-center gap-3">
            <div class="flex gap-0.5 text-sun" aria-label="Ocena 4,5 od 5">
              <Icon v-for="i in 5" :key="i" name="lucide:star" class="size-3 *:fill-current" />
            </div>
            <div class="leading-tight">
              <p class="text-sm font-semibold sm:text-base">
                4,5 / 5
              </p>
              <p class="text-[10px] font-light text-white/75">
                prosečna ocena
              </p>
            </div>
          </div>
          <div class="h-9 w-px shrink-0 bg-white/30" />
          <div class="leading-tight">
            <p class="text-sm font-semibold sm:text-base">
              Proizvedeno u Srbiji
            </p>
            <p class="text-[10px] font-light text-white/75">
              od košnice do tegle
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
