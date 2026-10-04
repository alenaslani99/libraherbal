<script setup lang="ts">
import { legalSectionsKey, type LegalSectionLink } from '~/utils/legal'

const props = defineProps<{
  title: string
  icon: string
  // "4. oktobar 2026."
  updated: string
  sections: LegalSectionLink[]
}>()

provide(legalSectionsKey, props.sections)

// Scroll-spy: highlight the section whose heading is in the upper part of the screen
const active = ref(props.sections[0]?.id)
let observer: IntersectionObserver | undefined

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) active.value = entry.target.id
    }
  }, { rootMargin: '-15% 0px -70% 0px' })
  for (const section of props.sections) {
    const el = document.getElementById(section.id)
    if (el) observer.observe(el)
  }
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<!-- Legal document (Uslovi korišćenja, Politika privatnosti): title, sticky table of contents, content card -->
<template>
  <div>
    <header class="bg-gradient-to-b from-pale-beige to-cream">
      <div class="mx-auto max-w-[1440px] px-4 pt-12 pb-10 sm:px-6 lg:px-16 lg:pt-16 lg:pb-14 xl:px-32">
        <div class="flex items-center gap-4">
          <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-sun-light/60 text-forest sm:size-14">
            <Icon :name="icon" class="size-6" />
          </span>
          <h1 class="text-4xl leading-none tracking-[-0.02em] text-forest sm:text-5xl lg:text-[56px]">
            {{ title }}
          </h1>
        </div>
        <p class="mt-4 text-sm text-muted">
          Poslednja izmena: {{ updated }}
        </p>
      </div>
    </header>

    <div class="mx-auto grid max-w-[1440px] gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 lg:px-16 lg:pb-24 xl:px-32">
      <nav aria-label="Sadržaj" class="lg:sticky lg:top-24 lg:self-start">
        <!-- phones/tablets: collapsible, desktop: always open -->
        <details class="group rounded-xl border border-line bg-paper p-4 lg:hidden">
          <summary class="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-forest">
            Sadržaj
            <Icon name="lucide:chevron-down" class="size-4 transition-transform group-open:rotate-180" />
          </summary>
          <ol class="mt-3 space-y-1">
            <li v-for="(section, i) in sections" :key="section.id">
              <a :href="`#${section.id}`" class="block rounded-md px-3 py-1.5 text-sm text-muted hover:text-forest">
                {{ i + 1 }}. {{ section.title }}
              </a>
            </li>
          </ol>
        </details>

        <div class="hidden lg:block">
          <p class="mb-3 text-sm font-semibold text-muted">
            Sadržaj
          </p>
          <ol class="space-y-1">
            <li v-for="(section, i) in sections" :key="section.id">
              <a
                :href="`#${section.id}`"
                class="block rounded-lg px-3 py-2 text-sm transition-colors duration-200"
                :class="active === section.id ? 'bg-pale-beige font-semibold text-forest' : 'text-muted hover:text-forest'"
                :aria-current="active === section.id ? 'location' : undefined"
              >
                {{ i + 1 }}. {{ section.title }}
              </a>
            </li>
          </ol>
        </div>
      </nav>

      <article class="space-y-10 rounded-2xl border border-line bg-paper px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <slot />
      </article>
    </div>
  </div>
</template>
