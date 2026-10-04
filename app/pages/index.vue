<script setup lang="ts">
import type { Product } from '#shared/types/product'
import { contact, footerAbout } from '~/data/footer'

const { data: popularProducts } = await useFetch<Product[]>('/api/products/popular', { default: () => [] })

usePageSeo({
  title: 'Prirodni med, biljni čajevi i melemi',
  description: 'Libra Herbal: domaći med sa lekovitim biljem, prirodni biljni čajevi i melemi iz male porodične proizvodnje. Dostava širom Srbije, plaćanje pouzećem.',
  image: '/og-image.jpg',
})

// Who we are, for Google's knowledge panel and sitelinks
const absolute = useAbsoluteUrl()
useJsonLd('organization', {
  '@type': 'Organization',
  'name': 'Libra Herbal',
  'url': absolute('/'),
  'logo': absolute('/web-app-manifest-512x512.png'),
  'description': footerAbout,
  'email': contact.email,
  'telephone': contact.phone.replace(/\s/g, ''),
  'areaServed': 'RS',
})
useJsonLd('website', {
  '@type': 'WebSite',
  'name': 'Libra Herbal',
  'url': absolute('/'),
  'inLanguage': 'sr',
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
