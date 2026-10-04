<script setup lang="ts">
import type { Product } from '#shared/types/product'

const { data: popularProducts } = await useFetch<Product[]>('/api/products/popular', { default: () => [] })

useSeoMeta({
  title: 'Prirodno rešenje vaših problema',
  description: 'Libra Herbal — med, čajevi i biljni preparati od lekovitih biljaka. Dostava širom Srbije, plaćanje pouzećem.',
  ogTitle: 'Libra Herbal — prirodno rešenje vaših problema',
  ogDescription: 'Med, čajevi i biljni preparati od lekovitih biljaka.',
})
</script>

<template>
  <div>
    <HomeHero />
    <HomeFeatures />
    <HomeCategories />
    <ProductShowcase
      title="Popularni artikli"
      subtitle="Pogledajte naše kategorije proizvoda."
      :products="popularProducts"
    />
    <CtaSection
      eyebrow="Proširite svoje znanje"
      title="Kako prirodnim putem do zdravlja?"
      text="Saznajte više o prirodnim metodama lečenja i njihovoj naučnoj osnovi."
      button-label="Posetite naš blog"
      to="/blog"
    />
    <HomeTestimonials />
    <NewsletterSection />
  </div>
</template>
