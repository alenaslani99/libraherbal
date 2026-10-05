<script setup lang="ts">
import { faqCategories } from '~/data/faq'

usePageSeo({
  title: 'Česta pitanja',
  description: 'Odgovori na česta pitanja o poručivanju, plaćanju pouzećem, dostavi širom Srbije, povraćaju robe i proizvodima Libra Herbal.',
})

const absolute = useAbsoluteUrl()
useJsonLd('faq', {
  '@type': 'FAQPage',
  'url': absolute('/cesta-pitanja'),
  'mainEntity': faqCategories.flatMap(category => category.items).map(item => ({
    '@type': 'Question',
    'name': item.question,
    'acceptedAnswer': { '@type': 'Answer', 'text': item.answer },
  })),
})
</script>

<template>
  <div>
    <!-- Figma "Hero": padding 72/128, bg Main Green -->
    <section class="bg-forest">
      <div class="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-16 lg:py-[72px] xl:px-32">
        <PageHeading eyebrow="Pomoć" title="Česta pitanja." light />
        <p class="mt-6 text-sm font-light text-white lg:mt-8">
          Ako ne pronađete odgovor,
          <NuxtLink to="/kontakt" class="underline underline-offset-2 transition-colors hover:text-sun">pišite nam</NuxtLink>.
        </p>
      </div>
    </section>

    <!-- Figma "FAQ": padding 72/128, bg Pale Beige; category title left, accordion right -->
    <section class="bg-pale-beige">
      <div class="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-16 lg:py-[72px] xl:px-32">
        <div class="mx-auto max-w-[900px] space-y-10 lg:space-y-8">
          <div
            v-for="category in faqCategories"
            :key="category.title"
            class="grid gap-2 lg:grid-cols-[254px_minmax(0,1fr)] lg:gap-0"
          >
            <h2 class="text-2xl leading-tight text-ink lg:pt-3">
              {{ category.title }}
            </h2>
            <div class="[&>details:last-child]:border-b-0">
              <AccordionItem v-for="item in category.items" :key="item.question" :title="item.question">
                <p class="text-sm leading-5">
                  {{ item.answer }}
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>
    </section>

    <NewsletterSection />
  </div>
</template>
