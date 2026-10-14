// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // fonts are self-hosted in assets/css/main.css (smaller Serbian subsets than @nuxt/fonts downloads)
  modules: ['@nuxt/icon', '@nuxt/image', '@nuxtjs/mdc', 'nitro-cloudflare-dev'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // components/content first: global, so Markdown can use them (::note in a blog post)
  components: [
    { path: '~/components/content', global: true, pathPrefix: false },
    { path: '~/components', pathPrefix: false },
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'sr' },
      title: 'Libra Herbal',
      titleTemplate: '%s | Libra Herbal',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#2d3a1f' },
        { name: 'apple-mobile-web-app-title', content: 'Libra Herbal' },
        // page-specific title, description, og:url, og:image and canonical come from usePageSeo()
        { property: 'og:site_name', content: 'Libra Herbal' },
        { property: 'og:locale', content: 'sr_RS' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      // Icon set generated from design/assets/favicon-source.png (node scripts/generate-icons.mjs)
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: '/favicon-16x16.png', sizes: '16x16' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  // Absolute URLs for canonical, og:url, og:image, sitemap and robots.txt.
  // Switch domains with NUXT_PUBLIC_SITE_URL (wrangler.jsonc "vars") — no trailing slash.
  runtimeConfig: {
    public: {
      siteUrl: 'https://libraherbal.rs',
    },
  },

  // <NuxtImg> resizes + converts to webp. Dev: ipx. Production: Cloudflare image transformations
  // (/cdn-cgi/image/w=640,f=webp,q=75/assets/...) — the Worker can't run ipx (no sharp), and without
  // a provider every srcset entry was the full-size original. Transformations must be enabled on the
  // libraherbal.rs zone (Dashboard → Images → Transformations), or every image 404s.
  image: {
    quality: 75,
  },
  $production: {
    image: { provider: 'cloudflare' },
  },

  features: {
    // Tailwind CSS goes into the HTML instead of a render-blocking <link> (~16 KB gzipped)
    inlineStyles: true,
  },

  hooks: {
    // No <link rel="prefetch"> for every lazy chunk (admin, account, editor…): wasted mobile bandwidth,
    // and Cloudflare Speed Brain answers uncached prefetches with 503, which shows up as console errors.
    // Chunks still load on navigation as usual.
    'build:manifest': (manifest) => {
      for (const chunk of Object.values(manifest)) chunk.prefetch = false
    },
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

  // Blog post bodies are Markdown from D1, rendered at request time with <MDC>.
  // No code highlighting (keeps Shiki out of the Worker), no # links inside headings.
  mdc: {
    highlight: false,
    headings: { anchorLinks: false },
  },

  // Cloudflare Workers. Bindings (D1 as `DB`) are declared in wrangler.jsonc;
  // nitro-cloudflare-dev exposes the local ones in `nuxt dev` (state in .wrangler/)
  nitro: {
    preset: 'cloudflare_module',
    // server/tasks/**; the Worker's scheduled() runs the tasks whose cron matches the trigger that fired.
    // Each cron here must also be in wrangler.jsonc "triggers", or Cloudflare never fires it.
    // In `nuxt dev`, run one by hand: GET /_nitro/tasks/emails:reminders
    experimental: { tasks: true },
    scheduledTasks: {
      '0 * * * *': ['emails:reminders'],
    },
  },

  // Storefront: SSR (SEO), private pages and admin: SPA
  // Static content pages (/o-nama, /kontakt, /dostava, /blog/**) get `prerender: true` once they exist
  routeRules: {
    // public/assets files aren't content-hashed, so a week instead of immutable (default was max-age=0)
    '/assets/**': { headers: { 'cache-control': 'public, max-age=604800, stale-while-revalidate=86400' } },
    '/korpa': { ssr: false },
    '/placanje': { ssr: false },
    '/hvala': { ssr: false },
    '/porudzbina/**': { ssr: false },
    '/nalog': { ssr: false },
    '/nalog/**': { ssr: false },
    '/admin/**': { ssr: false },
  },
})
