<script setup lang="ts">
import { heroFeatures } from '~/data/home'

usePageSeo({
  title: 'O nama',
  description: 'Libra Herbal je nastala iz jedne jednostavne ideje: ono što je dobro za svaki dan treba da bude zdravo i domaće. Med i bilje od porodičnih pčelara i berača iz Srbije.',
})

const absolute = useAbsoluteUrl()
useJsonLd('about', {
  '@type': 'AboutPage',
  'url': absolute('/o-nama'),
  'name': 'O nama | Libra Herbal',
})
</script>

<template>
  <div>
    <!-- Figma "Hero": padding 72/128, gap 48, bg Main Green -->
    <section class="bg-forest">
      <div class="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-16 lg:py-[72px] xl:px-32">
        <PageHeading eyebrow="Naša priča" title="Od polja i košnice" title-italic="do kuhinjske police." light />
        <p class="mt-8 max-w-[520px] text-sm font-light text-white lg:mt-12">
          Libra Herbal je nastala iz jedne jednostavne ideje:<br class="hidden sm:block">
          Ono što je dobro za svaki dan treba da bude zdravo i domaće.
        </p>
      </div>
    </section>

    <!-- Figma "1st": padding 72/192, image and text spread apart, bg Pale Beige -->
    <section class="bg-pale-beige">
      <div class="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,496px)_minmax(0,430px)] lg:justify-between lg:gap-16 lg:px-16 lg:py-[72px] xl:px-48">
        <NuxtImg
          src="/assets/img/o-nama.jpg"
          alt="Pčelar pregleda okvir iz košnice"
          width="999"
          height="665"
          sizes="xs:100vw sm:100vw md:100vw lg:496px"
          format="webp"
          loading="lazy"
          class="aspect-[4/3] w-full rounded-xl object-cover"
        />
        <div>
          <p class="text-xs uppercase leading-none tracking-[0.04em] text-brown-200">
            Kako radimo
          </p>
          <h2 class="mt-3 text-4xl leading-tight tracking-[-0.02em] text-forest sm:text-5xl">
            Polako i pažljivo
          </h2>
          <p class="mt-5 text-sm text-ink">
            <span class="block">Naši proizvodi nastaju u saradnji sa porodičnim pčelarima i beračima iz različitih krajeva Srbije.</span>
            <span class="block">Med se vrca kada je zreo, bilje se suše prirodno, a svaka serija dobija svoju analizu.</span>
            <span class="block">Ne pokušavamo da prirodi dodamo supermoći. Samo je čuvamo dovoljno dobro da stigne do vašeg stola.</span>
          </p>
        </div>
      </div>
    </section>

    <!-- Figma "Frame 64": padding 45/192, gap 48, bg brown-500 -->
    <section class="bg-brown-500 text-white">
      <div class="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-16 lg:py-[45px] xl:px-48">
        <p class="text-xs uppercase leading-none tracking-[0.04em] text-brown-200">
          Kako osvajamo vaše poverenje
        </p>
        <h2 class="mt-3 text-4xl leading-tight tracking-[-0.02em] sm:text-5xl">
          Naši principi
        </h2>

        <ul class="mt-10 grid gap-4 md:grid-cols-3 md:gap-6 lg:mt-12 lg:gap-x-20">
          <li
            v-for="item in heroFeatures"
            :key="item.title"
            class="rounded-xl border border-sun/40 bg-forest px-4 py-4"
          >
            <Icon :name="item.icon" class="size-5 text-sun" />
            <p class="mt-2 text-sm font-semibold leading-5">
              {{ item.title }}
            </p>
            <p class="text-xs font-light leading-4 text-white/80">
              {{ item.text }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <NewsletterSection />
  </div>
</template>
