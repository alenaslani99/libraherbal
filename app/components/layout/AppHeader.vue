<script setup lang="ts">
import { mainNav } from '~/data/navigation'

const menuOpen = ref(false)
const { count: cartCount } = useCart()

// Section match, so "Prodavnica" stays underlined on /proizvodi/<slug> (and Blog on /blog/<slug>)
const route = useRoute()
const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<template>
  <AppTopBar />

  <!-- Figma "Navbar Desktop": 1440 wide, hug 64px, padding 20/72, space-between, sticky -->
  <header class="sticky top-0 z-40 bg-pale-beige text-ink">
    <div class="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-5 sm:px-6 lg:px-[72px]">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="lg:hidden"
          aria-label="Otvori meni"
          :aria-expanded="menuOpen"
          @click="menuOpen = true"
        >
          <Icon name="lucide:menu" class="size-6" />
        </button>
        <AppLogo />
      </div>

      <nav class="hidden lg:block" aria-label="Glavna navigacija">
        <ul class="flex items-center gap-8">
          <li v-for="link in mainNav" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="relative py-0.5 text-base leading-5 transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-sun after:transition-transform after:duration-300 hover:text-forest hover:after:scale-x-100 [&.is-active]:text-forest [&.is-active]:after:scale-x-100"
              :class="{ 'is-active': isActive(link.to) }"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-5">
        <AccountMenu />
        <NuxtLink to="/korpa" class="relative transition-colors hover:text-forest" aria-label="Korpa">
          <Icon name="lucide:shopping-cart" class="size-6" />
          <!-- the cart lives in localStorage: render the badge only in the browser so SSR/SSG HTML stays identical for everyone -->
          <ClientOnly>
            <span
              v-if="cartCount > 0"
              class="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sun px-1 text-[10px] font-bold leading-none text-ink"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
              <span class="sr-only"> proizvoda u korpi</span>
            </span>
          </ClientOnly>
        </NuxtLink>
      </div>
    </div>

    <MobileMenu v-model:open="menuOpen" :links="mainNav" />
  </header>
</template>
