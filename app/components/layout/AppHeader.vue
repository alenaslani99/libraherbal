<script setup lang="ts">
import { mainNav } from '~/data/navigation'

const menuOpen = ref(false)
const cartCount = ref(0)
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
              class="relative py-0.5 text-base leading-5 transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-sun after:transition-transform after:duration-300 hover:text-forest hover:after:scale-x-100 [&.router-link-active]:text-forest [&.router-link-active]:after:scale-x-100"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-5">
        <NuxtLink to="/prijava" class="transition-colors hover:text-forest" aria-label="Moj nalog">
          <Icon name="lucide:user" class="size-6" />
        </NuxtLink>
        <NuxtLink to="/korpa" class="relative transition-colors hover:text-forest" aria-label="Korpa">
          <Icon name="lucide:shopping-cart" class="size-6" />
          <span
            v-if="cartCount > 0"
            class="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-sun text-[10px] font-bold text-ink"
          >
            {{ cartCount }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <MobileMenu v-model:open="menuOpen" :links="mainNav" />
  </header>
</template>
