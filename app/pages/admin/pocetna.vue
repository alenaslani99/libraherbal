<script setup lang="ts">
import type { AdminHero, Hero } from '#shared/types/site'
import { heroSchema, type HeroInput, type HeroSettings } from '#shared/schemas/site'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Početna strana' })

const { data, refresh } = await useFetch<AdminHero>('/api/admin/hero', { key: 'admin-hero' })

const form = reactive<HeroInput>({ ...data.value!.settings })
const errors = ref<Record<string, string>>({})
const notice = ref<{ ok: boolean, text: string } | null>(null)
const busy = ref(false)

function fill(settings: HeroSettings) {
  Object.assign(form, settings)
  errors.value = {}
}

// text fields, grouped as on the page; the rating is its own section below
type TextKey = Exclude<keyof HeroSettings, 'showRating' | 'ratingOverride'>
const groups: { title: string, hint?: string, fields: { key: TextKey, label: string, max: number, placeholder?: string, hint?: string, multiline?: boolean }[] }[] = [
  {
    title: 'Naslov',
    fields: [
      { key: 'titleLine1', label: 'Prvi red (beli)', max: 40 },
      { key: 'titleLine2', label: 'Drugi red (žuti, iskošen)', max: 40, hint: 'Prazno = samo jedan red.' },
      { key: 'subtitle', label: 'Podnaslov', max: 200, multiline: true },
    ],
  },
  {
    title: 'Pozadinska slika',
    fields: [
      { key: 'image', label: 'Adresa slike', max: 500, placeholder: '/assets/img/hero.jpg', hint: 'Putanja na sajtu (/assets/…) ili https:// link. Široka slika, najmanje 1536 px.' },
      { key: 'imageAlt', label: 'Opis slike', max: 150, hint: 'Za čitače ekrana; prazno ako je slika samo ukras.' },
    ],
  },
  {
    title: 'Dugmad',
    hint: 'Drugo dugme se prikazuje samo kada su popunjeni i tekst i link.',
    fields: [
      { key: 'primaryLabel', label: 'Prvo dugme — tekst', max: 30 },
      { key: 'primaryLink', label: 'Prvo dugme — link', max: 300, placeholder: '/proizvodi' },
      { key: 'secondaryLabel', label: 'Drugo dugme — tekst', max: 30 },
      { key: 'secondaryLink', label: 'Drugo dugme — link', max: 300, placeholder: '/o-nama' },
    ],
  },
  {
    title: 'Oznaka pored ocene',
    hint: 'Prazan naslov = oznaka se ne prikazuje.',
    fields: [
      { key: 'badgeTitle', label: 'Naslov', max: 40 },
      { key: 'badgeText', label: 'Tekst ispod', max: 40 },
    ],
  },
]

// ----- rating: the approved reviews' average unless the admin types a number --------------
const average = computed(() => data.value?.reviewAverage ?? null)
const decimal = (n: number) => n.toFixed(1).replace('.', ',')
// 1 recenzija, 2–4 recenzije, 5+ recenzija (11–14 too)
const reviewCountText = computed(() => {
  const n = data.value?.reviewCount ?? 0
  const few = n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)
  return `${n} ${few ? 'recenzije' : 'recenzija'}`
})
const override = computed(() => (form.ratingOverride === '' || form.ratingOverride == null ? null : Number(form.ratingOverride)))

// ----- live preview: the real HomeHero, drawn at 1440 px and scaled down ----------------
const preview = computed<Hero>(() => {
  const { showRating, ratingOverride: _, ...rest } = form
  return {
    ...(rest as Omit<HeroSettings, 'showRating' | 'ratingOverride'>),
    rating: showRating ? (override.value !== null && override.value >= 1 && override.value <= 5 ? override.value : average.value) : null,
  }
})
const PREVIEW_WIDTH = 1440
const frame = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const scale = ref(0.5)
const stageHeight = ref(660)
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(() => {
    scale.value = (frame.value?.clientWidth ?? PREVIEW_WIDTH) / PREVIEW_WIDTH
    stageHeight.value = stage.value?.offsetHeight ?? 660
  })
  observer.observe(frame.value!)
  observer.observe(stage.value!)
})
onBeforeUnmount(() => observer?.disconnect())

async function save() {
  const result = heroSchema.safeParse(form)
  errors.value = result.success ? {} : fieldErrors(result.error)
  notice.value = null
  if (!result.success) {
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
    notice.value = { ok: false, text: message }
  }
  finally {
    busy.value = false
  }
}

function resetToDefaults() {
  if (!window.confirm('Vratiti podrazumevani tekst i sliku? Promena se primenjuje tek kada kliknete „Sačuvaj".')) return
  fill(data.value!.defaults)
  notice.value = null
}

const input = 'block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900'
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-zinc-900">
          Početna strana
        </h1>
        <p class="mt-1 max-w-2xl text-sm text-zinc-500">
          Veliki baner (hero) na vrhu početne strane. Pregled ispod se menja dok kucate; posetioci vide promene tek kada sačuvate.
        </p>
      </div>
      <button type="button" class="shrink-0 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50" @click="resetToDefaults">
        Vrati podrazumevano
      </button>
    </div>

    <!-- inert: the preview's buttons must not navigate away from the form -->
    <div ref="frame" class="mt-6 overflow-hidden rounded-lg border border-zinc-200" :style="{ height: `${stageHeight * scale}px` }" inert>
      <div ref="stage" class="origin-top-left" :style="{ width: `${PREVIEW_WIDTH}px`, transform: `scale(${scale})` }">
        <HomeHero :hero="preview" />
      </div>
    </div>

    <form class="mt-6 space-y-6" novalidate @submit.prevent="save">
      <div class="grid gap-6 lg:grid-cols-2">
        <fieldset v-for="group in groups" :key="group.title" class="rounded-lg border border-zinc-200 bg-white p-4">
          <legend class="sr-only">
            {{ group.title }}
          </legend>
          <h2 class="text-sm font-semibold text-zinc-900">
            {{ group.title }}
          </h2>
          <p v-if="group.hint" class="mt-0.5 text-xs text-zinc-500">
            {{ group.hint }}
          </p>
          <div class="mt-3 space-y-3">
            <div v-for="f in group.fields" :key="f.key">
              <label :for="`h-${f.key}`" class="mb-1 block text-xs font-medium text-zinc-600">{{ f.label }}</label>
              <textarea
                v-if="f.multiline"
                :id="`h-${f.key}`"
                v-model="form[f.key]"
                rows="2"
                :maxlength="f.max"
                :class="[input, errors[f.key] ? 'border-red-500' : 'border-zinc-300', 'resize-y']"
              />
              <input
                v-else
                :id="`h-${f.key}`"
                v-model="form[f.key]"
                type="text"
                :maxlength="f.max"
                :placeholder="f.placeholder"
                :class="[input, errors[f.key] ? 'border-red-500' : 'border-zinc-300']"
              >
              <p v-if="errors[f.key] || f.hint" class="mt-1 text-xs" :class="errors[f.key] ? 'text-red-600' : 'text-zinc-500'">
                {{ errors[f.key] || f.hint }}
              </p>
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-lg border border-zinc-200 bg-white p-4">
          <legend class="sr-only">
            Ocena
          </legend>
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-sm font-semibold text-zinc-900">
              Ocena
            </h2>
            <label class="flex items-center gap-2 text-sm text-zinc-700">
              <input v-model="form.showRating" type="checkbox" class="size-4 rounded border-zinc-300 accent-zinc-900">
              Prikaži ocenu
            </label>
          </div>
          <p class="mt-2 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            <template v-if="average !== null">
              Prosek odobrenih recenzija: <strong>{{ decimal(average) }} / 5</strong> ({{ reviewCountText }})
            </template>
            <template v-else>
              Još nema odobrenih recenzija.
            </template>
            <NuxtLink to="/admin/recenzije" class="ml-1 text-zinc-900 underline underline-offset-2 hover:no-underline">Recenzije →</NuxtLink>
          </p>
          <div class="mt-3 space-y-3" :class="{ 'opacity-50': !form.showRating }">
            <div>
              <label for="h-ratingOverride" class="mb-1 block text-xs font-medium text-zinc-600">Ručna ocena</label>
              <input
                id="h-ratingOverride"
                v-model="form.ratingOverride"
                type="number"
                min="1"
                max="5"
                step="0.1"
                inputmode="decimal"
                :placeholder="average !== null ? decimal(average) : 'npr. 4,5'"
                :disabled="!form.showRating"
                :class="[input, 'max-w-32', errors.ratingOverride ? 'border-red-500' : 'border-zinc-300']"
              >
              <p class="mt-1 text-xs" :class="errors.ratingOverride ? 'text-red-600' : 'text-zinc-500'">
                {{ errors.ratingOverride || (override !== null
                  ? `Prikazuje se ${decimal(override)} umesto proseka. Obrišite broj da se vrati prosek.`
                  : average !== null ? 'Prazno = prikazuje se prosek odobrenih recenzija.' : 'Prazno i bez recenzija = ocena se ne prikazuje.') }}
              </p>
            </div>
            <div>
              <label for="h-ratingLabel" class="mb-1 block text-xs font-medium text-zinc-600">Tekst ispod ocene</label>
              <input id="h-ratingLabel" v-model="form.ratingLabel" type="text" maxlength="40" :disabled="!form.showRating" :class="[input, errors.ratingLabel ? 'border-red-500' : 'border-zinc-300']">
              <p v-if="errors.ratingLabel" class="mt-1 text-xs text-red-600">
                {{ errors.ratingLabel }}
              </p>
            </div>
          </div>
        </fieldset>
      </div>

      <div class="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
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
