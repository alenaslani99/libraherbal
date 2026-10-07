<script setup lang="ts">
import type { z } from 'zod'
import type { AdminHero } from '#shared/types/site'
import { HERO_ELEMENT_TYPES, HERO_MAX_ELEMENTS, heroSchema, type HeroElementInput, type HeroElementType, type HeroInput, type HeroSettings } from '#shared/schemas/site'
import { copyHeroElement, heroElementTypes, newHeroElement } from '~/data/heroElements'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Početna strana' })

const { data, refresh } = await useFetch<AdminHero>('/api/admin/hero', { key: 'admin-hero' })

const form = reactive<HeroInput>(structuredClone(data.value!.settings))
const errors = ref<Record<string, string>>({})
const notice = ref<{ ok: boolean, text: string } | null>(null)
const busy = ref(false)
// the element whose fields are open (one at a time)
const openId = ref<string | null>(null)

function fill(settings: HeroSettings) {
  Object.assign(form, structuredClone(toRaw(settings)))
  errors.value = {}
  openId.value = null
}

// Zod issues keyed by the whole path ("elements.2.lines.0.text"), so each element's editor
// can show its own errors
function pathErrors(error: z.ZodError) {
  const out: Record<string, string> = {}
  for (const issue of error.issues) out[issue.path.join('.')] ??= issue.message
  return out
}
function elementErrors(index: number) {
  const prefix = `elements.${index}.`
  return Object.fromEntries(Object.entries(errors.value).filter(([k]) => k.startsWith(prefix)).map(([k, v]) => [k.slice(prefix.length), v]))
}
const hasErrors = (index: number) => Object.keys(errors.value).some(k => k.startsWith(`elements.${index}.`))

// ----- elements: add, order, copy, remove --------------------------------------------------
const adding = ref(false)
const full = computed(() => form.elements.length >= HERO_MAX_ELEMENTS)
const hasHeading = computed(() => form.elements.some(e => e.type === 'heading'))

function add(type: HeroElementType) {
  const element = newHeroElement(type)
  form.elements.push(element)
  openId.value = element.id
  adding.value = false
}
function move(from: number, to: number) {
  if (to < 0 || to >= form.elements.length) return
  const [element] = form.elements.splice(from, 1)
  form.elements.splice(to, 0, element!)
  errors.value = {}
}
function duplicate(index: number) {
  const copy = copyHeroElement(form.elements[index]!)
  form.elements.splice(index + 1, 0, copy)
  openId.value = copy.id
  errors.value = {}
}
function remove(index: number) {
  if (!window.confirm(`Ukloniti element „${heroElementTypes[form.elements[index]!.type].label}"?`)) return
  form.elements.splice(index, 1)
  errors.value = {}
}

// one line about the element for its collapsed row
function summary(element: HeroElementInput): string {
  switch (element.type) {
    case 'eyebrow': return element.text
    case 'heading': return element.lines.map(l => l.text).join(' / ')
    case 'text': return element.text
    case 'buttons': return element.buttons.map(b => b.label).join(' · ')
    case 'rating': return element.override === null || element.override === '' || element.override === undefined
      ? (average.value !== null ? `Prosek recenzija (${decimal(average.value)})` : 'Prosek recenzija')
      : `Ručno: ${decimal(Number(element.override))}`
    case 'badge': return [element.title, element.text].filter(Boolean).join(' — ')
    case 'checklist': return element.items.filter(Boolean).join(' · ')
    case 'countdown': return Number.isNaN(Date.parse(element.endsAt)) ? '' : `do ${new Date(element.endsAt).toLocaleString('sr-Latn-RS', { dateStyle: 'medium', timeStyle: 'short' })}`
    case 'product': return data.value?.products.find(p => p.id === element.productId)?.name ?? ''
  }
}

// why an element isn't in the preview (the page leaves it out the same way)
function hiddenReason(element: HeroElementInput) {
  if (shown.value.has(element.id)) return ''
  if (element.type === 'rating') return 'Nema odobrenih recenzija — unesite ručnu ocenu.'
  if (element.type === 'countdown') return 'Datum je prošao.'
  if (element.type === 'product') return 'Izaberite proizvod.'
  return ''
}

// ----- live preview: the real HomeHero, drawn at 1440 px and scaled down ----------------
const average = computed(() => data.value?.reviewAverage ?? null)
const decimal = (n: number) => n.toFixed(1).replace('.', ',')
const now = ref(Date.now())
const preview = computed(() => resolveHero(form, { reviewAverage: average.value, products: data.value?.products ?? [], now: now.value }))
const shown = computed(() => new Set(preview.value.elements.map(e => e.id)))

const PREVIEW_WIDTH = 1440
const frame = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const scale = ref(0.5)
const stageHeight = ref(660)
let observer: ResizeObserver | undefined
let clock: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  observer = new ResizeObserver(() => {
    scale.value = (frame.value?.clientWidth ?? PREVIEW_WIDTH) / PREVIEW_WIDTH
    stageHeight.value = stage.value?.offsetHeight ?? 660
  })
  observer.observe(frame.value!)
  observer.observe(stage.value!)
  // so a countdown that runs out disappears from the preview too
  clock = setInterval(() => (now.value = Date.now()), 30_000)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  clearInterval(clock)
})

async function save() {
  const result = heroSchema.safeParse(form)
  errors.value = result.success ? {} : pathErrors(result.error)
  notice.value = null
  if (!result.success) {
    // open the first element with a problem
    const first = Object.keys(errors.value).map(k => /^elements\.(\d+)\./.exec(k)?.[1]).find(Boolean)
    if (first !== undefined) openId.value = form.elements[Number(first)]?.id ?? null
    notice.value = { ok: false, text: 'Proverite označena polja.' }
    return
  }
  busy.value = true
  try {
    await $fetch<unknown>('/api/admin/hero', { method: 'PUT', body: result.data })
    await Promise.all([refresh(), refreshNuxtData('home-hero')])
    fill(data.value!.settings)
    notice.value = { ok: true, text: 'Sačuvano. Promene su vidljive na početnoj strani.' }
  }
  catch (error) {
    const { fields, message } = apiError(error)
    errors.value = fields
    notice.value = { ok: false, text: message || Object.values(fields)[0] || 'Proverite označena polja.' }
  }
  finally {
    busy.value = false
  }
}

function resetToDefaults() {
  if (!window.confirm('Vratiti prvobitni hero? Promena se primenjuje tek kada kliknete „Sačuvaj".')) return
  fill(data.value!.defaults)
  notice.value = null
}

const OPTIONS = {
  overlay: [{ value: 'light', label: 'Svetlo' }, { value: 'medium', label: 'Srednje' }, { value: 'dark', label: 'Tamno' }],
  align: [{ value: 'left', label: 'Levo' }, { value: 'center', label: 'Sredina' }],
  height: [{ value: 'tall', label: 'Visok' }, { value: 'medium', label: 'Niži' }],
} as const

const input = 'block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900'
const iconButton = 'rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30'
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-zinc-900">
          Početna strana
        </h1>
        <p class="mt-1 max-w-2xl text-sm text-zinc-500">
          Veliki baner (hero) na vrhu početne strane: izaberite pozadinu, pa dodajte i poređajte elemente. Pregled se menja dok radite; posetioci vide promene tek kada sačuvate.
        </p>
      </div>
      <button type="button" class="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50" @click="resetToDefaults">
        Vrati prvobitni
      </button>
    </div>

    <!-- inert: the preview's links must not navigate away from the form -->
    <div ref="frame" class="mt-6 overflow-hidden rounded-lg border border-zinc-200" :style="{ height: `${stageHeight * scale}px` }" inert>
      <div ref="stage" class="origin-top-left" :style="{ width: `${PREVIEW_WIDTH}px`, transform: `scale(${scale})` }">
        <HomeHero :hero="preview" />
      </div>
    </div>

    <form class="mt-6" novalidate @submit.prevent="save">
      <div class="grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
        <!-- background and layout -->
        <fieldset class="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
          <legend class="sr-only">
            Pozadina i raspored
          </legend>
          <h2 class="text-sm font-semibold text-zinc-900">
            Pozadina i raspored
          </h2>
          <div>
            <label for="h-image" class="mb-1 block text-xs font-medium text-zinc-600">Adresa slike</label>
            <input id="h-image" v-model="form.image" type="text" maxlength="500" placeholder="/assets/img/hero.jpg" :class="[input, errors.image ? 'border-red-500' : 'border-zinc-300']">
            <p class="mt-1 text-xs" :class="errors.image ? 'text-red-600' : 'text-zinc-500'">
              {{ errors.image || 'Putanja na sajtu (/assets/…) ili https:// link. Široka slika, najmanje 1536 px.' }}
            </p>
          </div>
          <div>
            <label for="h-alt" class="mb-1 block text-xs font-medium text-zinc-600">Opis slike</label>
            <input id="h-alt" v-model="form.imageAlt" type="text" maxlength="150" :class="[input, errors.imageAlt ? 'border-red-500' : 'border-zinc-300']">
            <p class="mt-1 text-xs" :class="errors.imageAlt ? 'text-red-600' : 'text-zinc-500'">
              {{ errors.imageAlt || 'Za čitače ekrana; prazno ako je slika samo ukras.' }}
            </p>
          </div>
          <div v-for="(options, key) in OPTIONS" :key="key">
            <p :id="`h-${key}`" class="mb-1 text-xs font-medium text-zinc-600">
              {{ { overlay: 'Zatamnjenje slike', align: 'Poravnanje teksta', height: 'Visina' }[key] }}
            </p>
            <div class="flex rounded-md border border-zinc-300 p-0.5 text-sm" role="radiogroup" :aria-labelledby="`h-${key}`">
              <label v-for="o in options" :key="o.value" class="flex-1 cursor-pointer rounded px-2 py-1.5 text-center has-[:checked]:bg-zinc-900 has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-900">
                <input v-model="form[key]" type="radio" :name="`h-${key}`" :value="o.value" class="sr-only">
                {{ o.label }}
              </label>
            </div>
          </div>
        </fieldset>

        <!-- elements -->
        <section class="rounded-lg border border-zinc-200 bg-white" aria-labelledby="h-elements">
          <div class="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
            <h2 id="h-elements" class="text-sm font-semibold text-zinc-900">
              Elementi <span class="font-normal text-zinc-500">{{ form.elements.length }}/{{ HERO_MAX_ELEMENTS }}</span>
            </h2>
            <button
              type="button"
              :disabled="full"
              :aria-expanded="adding"
              class="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
              @click="adding = !adding"
            >
              <Icon :name="adding ? 'lucide:x' : 'lucide:plus'" class="size-4" />
              {{ adding ? 'Zatvori' : 'Dodaj element' }}
            </button>
          </div>

          <!-- element types -->
          <div v-if="adding" class="grid gap-2 border-b border-zinc-100 bg-zinc-50 p-3 sm:grid-cols-2 xl:grid-cols-3">
            <button
              v-for="type in HERO_ELEMENT_TYPES"
              :key="type"
              type="button"
              :disabled="type === 'heading' && hasHeading"
              :title="type === 'heading' && hasHeading ? 'Hero već ima naslov.' : undefined"
              class="flex items-start gap-3 rounded-md border border-zinc-200 bg-white p-3 text-left hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-200"
              @click="add(type)"
            >
              <Icon :name="heroElementTypes[type].icon" class="mt-0.5 size-4 shrink-0 text-zinc-500" />
              <span>
                <span class="block text-sm font-medium text-zinc-900">{{ heroElementTypes[type].label }}</span>
                <span class="block text-xs text-zinc-500">{{ heroElementTypes[type].hint }}</span>
              </span>
            </button>
          </div>

          <p v-if="errors.elements" class="mx-4 mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {{ errors.elements }}
          </p>
          <p v-if="!form.elements.length" class="py-10 text-center text-sm text-zinc-500">
            Nema elemenata. Kliknite „Dodaj element".
          </p>

          <ol class="divide-y divide-zinc-100">
            <li v-for="(element, i) in form.elements" :key="element.id">
              <div class="flex items-center gap-2 px-4 py-2.5" :class="{ 'bg-zinc-50': openId === element.id }">
                <button
                  type="button"
                  class="flex min-w-0 flex-1 items-center gap-3 text-left"
                  :aria-expanded="openId === element.id"
                  @click="openId = openId === element.id ? null : element.id"
                >
                  <Icon :name="heroElementTypes[element.type].icon" class="size-4 shrink-0" :class="hasErrors(i) ? 'text-red-500' : 'text-zinc-500'" />
                  <span class="shrink-0 text-sm font-medium" :class="hasErrors(i) ? 'text-red-600' : 'text-zinc-900'">{{ heroElementTypes[element.type].label }}</span>
                  <span class="min-w-0 truncate text-sm text-zinc-500">{{ summary(element) }}</span>
                  <span v-if="hiddenReason(element)" class="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800" :title="hiddenReason(element)">Ne prikazuje se</span>
                </button>
                <div class="flex shrink-0 items-center">
                  <button type="button" :class="iconButton" :disabled="i === 0" :aria-label="`Pomeri ${heroElementTypes[element.type].label} gore`" @click="move(i, i - 1)">
                    <Icon name="lucide:chevron-up" class="size-4" />
                  </button>
                  <button type="button" :class="iconButton" :disabled="i === form.elements.length - 1" :aria-label="`Pomeri ${heroElementTypes[element.type].label} dole`" @click="move(i, i + 1)">
                    <Icon name="lucide:chevron-down" class="size-4" />
                  </button>
                  <button type="button" :class="iconButton" :disabled="full || element.type === 'heading'" title="Napravi kopiju" :aria-label="`Kopiraj ${heroElementTypes[element.type].label}`" @click="duplicate(i)">
                    <Icon name="lucide:copy" class="size-4" />
                  </button>
                  <button type="button" class="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600" title="Ukloni" :aria-label="`Ukloni ${heroElementTypes[element.type].label}`" @click="remove(i)">
                    <Icon name="lucide:trash-2" class="size-4" />
                  </button>
                </div>
              </div>
              <div v-if="openId === element.id" class="border-t border-zinc-100 px-4 py-4">
                <p v-if="hiddenReason(element)" class="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Ne prikazuje se na sajtu: {{ hiddenReason(element) }}
                </p>
                <HeroElementEditor
                  v-model="form.elements[i]!"
                  :errors="elementErrors(i)"
                  :products="data?.products ?? []"
                  :review-average="average"
                  :review-count="data?.reviewCount ?? 0"
                />
              </div>
            </li>
          </ol>
        </section>
      </div>

      <div class="sticky bottom-0 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
        <button type="submit" :disabled="busy" class="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50">
          <Icon v-if="busy" name="lucide:loader-circle" class="size-4 animate-spin" />
          Sačuvaj
        </button>
        <p v-if="notice" class="text-sm" :class="notice.ok ? 'text-emerald-700' : 'text-red-600'" :role="notice.ok ? 'status' : 'alert'">
          {{ notice.text }}
        </p>
      </div>
    </form>
  </div>
</template>
