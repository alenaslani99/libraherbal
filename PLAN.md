# Libra Herbal — Project Plan

Herbal products e-commerce for Serbia. Serbian language, prices in RSD, **Cash on Delivery only** (for now).

## Stack
- **Nuxt 4** + **Tailwind CSS v4** (`@tailwindcss/vite`)
- `@nuxt/icon` with **Lucide** (`lucide:*`, bundled locally via `@iconify-json/lucide`)
- `@nuxt/image` (`<NuxtImg>`, ipx in dev, Cloudflare provider in production)
- `@nuxt/fonts`
- `@nuxt/content`: **editorial content only** (blog, static pages), never products
- Later: **Cloudflare Workers** + **D1** (Drizzle) + R2 for product images

## Rendering strategy (`routeRules` in `nuxt.config.ts`)
| Routes | Mode |
|---|---|
| `/`, `/prodavnica`, `/kategorija/**`, `/proizvod/**` | SSR (edge cache/SWR once on Workers) |
| `/o-nama`, `/kontakt`, `/dostava`, legal, `/blog/**` | SSG (prerender) |
| `/korpa`, `/porudzbina/**`, `/nalog/**` | client-only |
| `/admin/**` | SPA |

## Conventions
- Components are auto-imported without a folder prefix (`<AppHeader>`, not `<LayoutAppHeader>`).
- Design tokens live only in `app/assets/css/main.css` (`@theme`).
- Prices: no formatter. Print the backend value as-is: `<p>{{ product.price }},00 <span>RSD</span></p>`
- Mock data in `app/data/*` is shaped like future API responses, so swapping in `useFetch` won't change the UI.
- Figma exports go in `design/` (PNG frames) and `design/assets/` (logo SVG, images).

## Folder structure
```
app/
  assets/css/main.css      Tailwind + design tokens
  components/
    layout/                AppLogo, AppHeader (+ top bar), MobileMenu, AppFooter
    ui/                    BaseButton, BaseContainer, BaseInput, SectionHeading
    sections/              CtaSection, NewsletterSection (reusable)
      home/                HomeHero, HomeFeatures, HomeFinder, HomePopularProducts, HomeTestimonials
    product/               ProductCard
  data/                    navigation, footer, home (static copy)
  layouts/default.vue
  pages/index.vue
content/                   Nuxt Content (later)
public/images/
design/                    Figma exports (reference only)
```

## Roadmap
- [x] 1. Folder structure, config, layout (navigation, CTA, footer), home page rebuilt from the Figma screenshot
- [ ] 1b. Real assets: logo SVG, hero photo, product/CTA photos; fine-tune spacing with a high-res Figma export
- [ ] 2. Shop listing + product detail pages (mock data)
- [ ] 3. Cart + COD checkout UI
- [~] 4. Account pages: login (/prijava) + register (/registracija) UI done (client validation, no backend yet); orders, addresses todo
- [ ] 5. Nuxt Content: blog + static pages
- [ ] 6. Admin SPA UI
- [ ] 7. Backend: Cloudflare Worker preset, D1 + Drizzle, API, auth, R2, SWR cache, then replace the mocks
- [ ] 8. Deploy

## TODO
- [ ] **Emails via Resend** (API key as a Worker secret, e.g. `RESEND_API_KEY`; sender on a verified domain)
  - Newsletter: welcome email with an unsubscribe link → set `newsletter_subscribers.status = 'unsubscribed'` + `unsubscribed_at` (columns already exist, see `server/api/newsletter.post.ts`)
  - Order confirmation to the customer (number, items, total, COD note, link to /prati-porudzbinu)
  - New-order alert to the shop
  - Contact form: notify the shop of a new message (`server/api/contact.post.ts`)
  - Shared HTML email template (logo, colors, footer with company details)
- [ ] **Social links**: real Facebook / Instagram / TikTok profile URLs in `app/data/footer.ts` (now generic facebook.com etc.)
- Stock stays manual on purpose: orders don't reduce `products.stock`; 0 = "Nema na stanju"
