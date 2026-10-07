<script setup lang="ts">
import type { Hero, HeroBlock } from '#shared/types/site'

// written in /admin/pocetna (which also renders this as its live preview)
const props = defineProps<{ hero: Hero }>()

type StatBlock = Extract<HeroBlock, { type: 'rating' | 'badge' }>
type Row = { kind: 'single', id: string, block: Exclude<HeroBlock, StatBlock> } | { kind: 'stats', id: string, items: StatBlock[] }

// ratings and badges next to each other share one row, split by thin lines
const rows = computed(() => {
  const list: Row[] = []
  for (const block of props.hero.elements) {
    const last = list.at(-1)
    if (block.type === 'rating' || block.type === 'badge') {
      if (last?.kind === 'stats') last.items.push(block)
      else list.push({ kind: 'stats', id: block.id, items: [block] })
    }
    else {
      list.push({ kind: 'single', id: block.id, block })
    }
  }
  return list
})
const hasHeading = computed(() => props.hero.elements.some(b => b.type === 'heading'))

// space above each element, from the Figma hero (text 28px, buttons 64px, stats 24px…)
const GAP: Record<Exclude<HeroBlock['type'], StatBlock['type']> | 'stats', string> = {
  eyebrow: 'mt-8',
  heading: 'mt-4',
  text: 'mt-7',
  buttons: 'mt-10 sm:mt-12 lg:mt-16',
  checklist: 'mt-7',
  countdown: 'mt-8',
  product: 'mt-8',
  stats: 'mt-8 sm:mt-6',
}
const gap = (row: Row, i: number) => (i === 0 ? '' : GAP[row.kind === 'stats' ? 'stats' : row.block.type])

const OVERLAY = {
  light: 'from-black/40 via-black/10',
  medium: 'from-black/60 via-black/20',
  dark: 'from-black/75 via-black/40',
}
const center = computed(() => props.hero.align === 'center')
const decimal = (n: number) => n.toFixed(1).replace('.', ',')
</script>

<template>
  <section class="relative isolate overflow-hidden bg-forest-dark">
    <!-- site paths go through the image optimizer; external URLs are shown as they are (see BlogImage) -->
    <NuxtImg
      v-if="hero.image.startsWith('/')"
      :src="hero.image"
      :alt="hero.imageAlt"
      width="1536"
      height="1024"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
      format="webp"
      preload
      fetchpriority="high"
      class="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]"
    />
    <img
      v-else
      :src="hero.image"
      :alt="hero.imageAlt"
      width="1536"
      height="1024"
      fetchpriority="high"
      referrerpolicy="no-referrer"
      class="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center]"
    >
    <!-- Figma: two linear gradients — black from the left (text contrast), main green from the bottom (blends into Specs Bar).
         Centered text gets an even darkening instead, since it sits over the middle of the photo. -->
    <div v-if="center" class="absolute inset-0 -z-10" :class="{ light: 'bg-black/25', medium: 'bg-black/40', dark: 'bg-black/55' }[hero.overlay]" />
    <div v-else class="absolute inset-0 -z-10 bg-gradient-to-r to-transparent" :class="OVERLAY[hero.overlay]" />
    <div class="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-forest/70 to-transparent" />
    <!-- below lg the text sits over the jar, so darken the whole photo a bit -->
    <div v-if="!center" class="absolute inset-0 -z-10 bg-black/35 lg:hidden" />

    <div
      class="mx-auto flex max-w-[1440px] items-center px-4 py-16 sm:py-20 sm:px-6 lg:px-16 xl:px-32"
      :class="[
        hero.height === 'tall' ? 'min-h-[560px] lg:min-h-[660px]' : 'min-h-[420px] lg:min-h-[480px]',
        { 'justify-center text-center': center },
      ]"
    >
      <div class="w-full sm:w-auto" :class="{ 'flex flex-col items-center': center }">
        <h1 v-if="!hasHeading" class="sr-only">
          Libra Herbal
        </h1>

        <template v-for="(row, i) in rows" :key="row.id">
          <!-- ratings and badges -->
          <div v-if="row.kind === 'stats'" class="flex flex-wrap items-center gap-4 text-white sm:gap-6" :class="[gap(row, i), { 'justify-center': center }]">
            <template v-for="(item, n) in row.items" :key="item.id">
              <div v-if="n > 0" class="h-9 w-px shrink-0 bg-white/30" />
              <div v-if="item.type === 'rating'" class="flex items-center gap-3 text-left">
                <div class="flex gap-0.5" role="img" :aria-label="`Ocena ${decimal(item.value)} od 5`">
                  <Icon v-for="s in 5" :key="s" name="lucide:star" class="size-3 *:fill-current" :class="s <= Math.round(item.value) ? 'text-sun' : 'text-white/30'" />
                </div>
                <div class="leading-tight">
                  <p class="text-sm font-semibold sm:text-base">
                    {{ decimal(item.value) }} / 5
                  </p>
                  <p v-if="item.label" class="text-[10px] font-light text-white/75">
                    {{ item.label }}
                  </p>
                </div>
              </div>
              <div v-else class="text-left leading-tight">
                <p class="text-sm font-semibold sm:text-base">
                  {{ item.title }}
                </p>
                <p v-if="item.text" class="text-[10px] font-light text-white/75">
                  {{ item.text }}
                </p>
              </div>
            </template>
          </div>

          <p v-else-if="row.block.type === 'eyebrow'" class="inline-block self-start rounded-full bg-sun px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink" :class="[gap(row, i), { 'self-center': center }]">
            {{ row.block.text }}
          </p>

          <h1 v-else-if="row.block.type === 'heading'" class="text-[44px] leading-none tracking-[-0.02em] text-white sm:text-[60px] sm:whitespace-nowrap lg:text-[72px]" :class="gap(row, i)">
            <template v-for="(line, n) in row.block.lines" :key="n">
              <em v-if="line.accent" class="block text-sun">{{ line.text }}</em>
              <span v-else class="block">{{ line.text }}</span>
            </template>
          </h1>

          <p v-else-if="row.block.type === 'text'" class="max-w-[354px] text-base font-light leading-[18px] text-white" :class="gap(row, i)">
            {{ row.block.text }}
          </p>

          <div v-else-if="row.block.type === 'buttons'" class="flex flex-col gap-3 sm:flex-row" :class="[gap(row, i), { 'sm:justify-center': center }]">
            <BaseButton
              v-for="(button, n) in row.block.buttons"
              :key="n"
              :to="button.link"
              :variant="button.style === 'solid' ? 'sun' : 'outline-light'"
              size="lg"
              :class="{ 'font-medium': button.style === 'solid' }"
            >
              {{ button.label }}
              <Icon v-if="button.style === 'solid'" name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </BaseButton>
          </div>

          <ul v-else-if="row.block.type === 'checklist'" class="space-y-2.5 text-left text-white" :class="gap(row, i)">
            <li v-for="(item, n) in row.block.items" :key="n" class="flex items-center gap-3 text-sm sm:text-base">
              <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-sun text-ink">
                <Icon name="lucide:check" class="size-3" />
              </span>
              {{ item }}
            </li>
          </ul>

          <HeroCountdown v-else-if="row.block.type === 'countdown'" :ends-at="row.block.endsAt" :label="row.block.label" :class="gap(row, i)" />

          <NuxtLink
            v-else-if="row.block.type === 'product'"
            :to="`/proizvodi/${row.block.product.slug}`"
            class="group flex max-w-sm items-center gap-4 rounded-2xl bg-white/10 p-3 pr-5 text-left text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors hover:bg-white/15"
            :class="gap(row, i)"
          >
            <BlogImage
              v-if="row.block.product.image"
              :src="row.block.product.image"
              :alt="row.block.product.name"
              :width="64"
              :height="64"
              sizes="64px"
              class="size-16 shrink-0 rounded-xl bg-white object-cover"
            />
            <div class="min-w-0">
              <p v-if="row.block.label" class="text-[10px] font-semibold uppercase tracking-wider text-sun">
                {{ row.block.label }}
              </p>
              <p class="truncate font-semibold">
                {{ row.block.product.name }}
              </p>
              <p class="text-sm">
                <del v-if="row.block.product.regularPrice" class="mr-1.5 text-white/60"><span class="sr-only">Stara cena: </span>{{ row.block.product.regularPrice }},00 RSD</del>
                <span v-if="row.block.product.regularPrice" class="sr-only">Akcijska cena: </span>{{ row.block.product.price }},00 RSD
              </p>
            </div>
            <Icon name="lucide:arrow-right" class="ml-auto size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </NuxtLink>
        </template>
      </div>
    </div>
  </section>
</template>
