// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/image', '@nuxt/content'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  components: [{ path: '~/components', pathPrefix: false }],

  app: {
    head: {
      htmlAttrs: { lang: 'sr' },
      title: 'Libra Herbal',
      titleTemplate: '%s · Libra Herbal',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  fonts: {
    defaults: { weights: [300, 400, 500, 600, 700], styles: ['normal', 'italic'] },
  },

  // Only icons actually used in app/ are bundled (scanned from .vue and .ts, e.g. app/data/*.ts).
  // No runtime JSON loading or Iconify API calls: small bundle for Cloudflare Workers, and it
  // avoids the createRequire crash in the Windows prerender step.
  icon: {
    mode: 'svg',
    provider: 'none',
    fallbackToApi: false,
    serverBundle: false,
    clientBundle: {
      scan: { globInclude: ['app/**/*.{vue,ts}'] },
    },
  },

  content: {
    experimental: { sqliteConnector: 'native' },
  },

  // Storefront: SSR (SEO), private pages and admin: SPA
  // Static content pages (/o-nama, /kontakt, /dostava, /blog/**) get `prerender: true` once they exist
  routeRules: {
    '/korpa': { ssr: false },
    '/placanje': { ssr: false },
    '/hvala': { ssr: false },
    '/porudzbina/**': { ssr: false },
    '/nalog/**': { ssr: false },
    '/admin/**': { ssr: false },
  },
})
