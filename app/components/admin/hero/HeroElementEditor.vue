<script setup lang="ts">
import type { HeroElementInput } from '#shared/schemas/site'
import type { Product } from '#shared/types/product'

// The fields of one hero element in /admin/pocetna. `errors` are keyed by the path
// inside the element ("text", "lines.0.text", "buttons").
const element = defineModel<HeroElementInput>({ required: true })
const props = defineProps<{
  errors: Record<string, string>
  products: Product[]
  reviewAverage: number | null
  reviewCount: number
}>()

const uid = useId()
const fid = (name: string) => `${uid}-${name}`
const border = (key: string) => (props.errors[key] ? 'border-red-500' : 'border-zinc-300')
const decimal = (n: number) => n.toFixed(1).replace('.', ',')

// 1 recenzija, 2–4 recenzije, 5+ recenzija (11–14 too)
const reviewCountText = computed(() => {
  const n = props.reviewCount
  const few = n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14)
  return `${n} ${few ? 'recenzije' : 'recenzija'}`
})

// <input type="datetime-local"> works in the browser's time zone, the API in ISO (UTC)
const localEnd = computed({
  get() {
    if (element.value.type !== 'countdown' || !element.value.endsAt) return ''
    const d = new Date(element.value.endsAt)
    return Number.isNaN(d.getTime()) ? '' : new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
  },
  set(value: string) {
    if (element.value.type === 'countdown') element.value.endsAt = value ? new Date(value).toISOString() : ''
  },
})

const productOptions = computed(() => props.products.map(p => ({
  value: p.id,
  label: p.name,
  hint: `${p.price},00 RSD${p.weight ? ` · ${p.weight}` : ''}`,
})))

const input = 'block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900'
const label = 'mb-1 block text-xs font-medium text-zinc-600'
const addButton = 'inline-flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900 disabled:opacity-40'
const removeButton = 'rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30'
</script>

<template>
  <div class="space-y-3">
    <!-- Natpis -->
    <div v-if="element.type === 'eyebrow'">
      <label :for="fid('text')" :class="label">Tekst</label>
      <input :id="fid('text')" v-model="element.text" type="text" maxlength="40" placeholder="AKCIJA -20%" :class="[input, border('text')]">
      <p v-if="errors.text" class="mt-1 text-xs text-red-600">
        {{ errors.text }}
      </p>
    </div>

    <!-- Naslov -->
    <template v-else-if="element.type === 'heading'">
      <div v-for="(line, i) in element.lines" :key="i">
        <label :for="fid(`line-${i}`)" :class="label">{{ i + 1 }}. red</label>
        <div class="flex items-center gap-2">
          <input :id="fid(`line-${i}`)" v-model="line.text" type="text" maxlength="40" :class="[input, border(`lines.${i}.text`)]">
          <label class="flex shrink-0 items-center gap-1.5 text-xs text-zinc-700">
            <input v-model="line.accent" type="checkbox" class="size-4 rounded border-zinc-300 accent-zinc-900">
            Žuti
          </label>
          <button type="button" :class="removeButton" :disabled="element.lines.length <= 1" :aria-label="`Ukloni ${i + 1}. red`" @click="element.lines.splice(i, 1)">
            <Icon name="lucide:x" class="size-4" />
          </button>
        </div>
        <p v-if="errors[`lines.${i}.text`]" class="mt-1 text-xs text-red-600">
          {{ errors[`lines.${i}.text`] }}
        </p>
      </div>
      <button type="button" :class="addButton" :disabled="element.lines.length >= 3" @click="element.lines.push({ text: '', accent: !element.lines.at(-1)?.accent })">
        <Icon name="lucide:plus" class="size-3.5" /> Dodaj red
      </button>
      <p class="text-xs text-zinc-500">
        „Žuti" redovi su iskošeni, kao „vaših problema." Najbolje izgleda do ~20 slova po redu.
      </p>
    </template>

    <!-- Tekst -->
    <div v-else-if="element.type === 'text'">
      <label :for="fid('text')" :class="label">Tekst</label>
      <textarea :id="fid('text')" v-model="element.text" rows="3" maxlength="300" :class="[input, border('text'), 'resize-y']" />
      <p class="mt-1 flex justify-between text-xs" :class="errors.text ? 'text-red-600' : 'text-zinc-500'">
        <span>{{ errors.text || 'Jedna do dve rečenice.' }}</span>
        <span>{{ element.text.length }}/300</span>
      </p>
    </div>

    <!-- Dugmad -->
    <template v-else-if="element.type === 'buttons'">
      <div v-for="(button, i) in element.buttons" :key="i" class="rounded-md border border-zinc-200 p-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-medium text-zinc-600">{{ i + 1 }}. dugme</span>
          <div class="flex items-center gap-1">
            <div class="flex rounded-md border border-zinc-300 p-0.5 text-xs" role="radiogroup" :aria-label="`Izgled ${i + 1}. dugmeta`">
              <label v-for="style in (['solid', 'outline'] as const)" :key="style" class="cursor-pointer rounded px-2 py-1 has-[:checked]:bg-zinc-900 has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-900">
                <input v-model="button.style" type="radio" :name="fid(`style-${i}`)" :value="style" class="sr-only">
                {{ style === 'solid' ? 'Žuto' : 'Obrub' }}
              </label>
            </div>
            <button type="button" :class="removeButton" :disabled="element.buttons.length <= 1" :aria-label="`Ukloni ${i + 1}. dugme`" @click="element.buttons.splice(i, 1)">
              <Icon name="lucide:x" class="size-4" />
            </button>
          </div>
        </div>
        <div class="mt-2 grid gap-2 sm:grid-cols-2">
          <div>
            <label :for="fid(`label-${i}`)" class="sr-only">Tekst dugmeta</label>
            <input :id="fid(`label-${i}`)" v-model="button.label" type="text" maxlength="30" placeholder="Tekst" :class="[input, border(`buttons.${i}.label`)]">
            <p v-if="errors[`buttons.${i}.label`]" class="mt-1 text-xs text-red-600">
              {{ errors[`buttons.${i}.label`] }}
            </p>
          </div>
          <div>
            <label :for="fid(`link-${i}`)" class="sr-only">Link dugmeta</label>
            <input :id="fid(`link-${i}`)" v-model="button.link" type="text" maxlength="300" placeholder="/proizvodi" :class="[input, border(`buttons.${i}.link`)]">
            <p v-if="errors[`buttons.${i}.link`]" class="mt-1 text-xs text-red-600">
              {{ errors[`buttons.${i}.link`] }}
            </p>
          </div>
        </div>
      </div>
      <button type="button" :class="addButton" :disabled="element.buttons.length >= 3" @click="element.buttons.push({ label: '', link: '', style: 'outline' })">
        <Icon name="lucide:plus" class="size-3.5" /> Dodaj dugme
      </button>
    </template>

    <!-- Ocena -->
    <template v-else-if="element.type === 'rating'">
      <p class="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
        <template v-if="reviewAverage !== null">
          Prosek odobrenih recenzija: <strong>{{ decimal(reviewAverage) }} / 5</strong> ({{ reviewCountText }})
        </template>
        <template v-else>
          Još nema odobrenih recenzija.
        </template>
        <NuxtLink to="/admin/recenzije" class="ml-1 text-zinc-900 underline underline-offset-2 hover:no-underline">Recenzije →</NuxtLink>
      </p>
      <div class="grid gap-3 sm:grid-cols-[8rem_1fr]">
        <div>
          <label :for="fid('override')" :class="label">Ručna ocena</label>
          <input
            :id="fid('override')"
            v-model="element.override"
            type="number"
            min="1"
            max="5"
            step="0.1"
            inputmode="decimal"
            :placeholder="reviewAverage !== null ? decimal(reviewAverage) : 'npr. 4,5'"
            :class="[input, border('override')]"
          >
        </div>
        <div>
          <label :for="fid('label')" :class="label">Tekst ispod ocene</label>
          <input :id="fid('label')" v-model="element.label" type="text" maxlength="40" :class="[input, border('label')]">
        </div>
      </div>
      <p class="text-xs" :class="errors.override || errors.label ? 'text-red-600' : 'text-zinc-500'">
        {{ errors.override || errors.label || (element.override !== null && element.override !== ''
          ? 'Prikazuje se ručna ocena. Obrišite broj da se vrati prosek.'
          : reviewAverage !== null ? 'Prazno = prosek odobrenih recenzija.' : 'Prazno i bez recenzija = ocena se ne prikazuje.') }}
      </p>
    </template>

    <!-- Oznaka -->
    <div v-else-if="element.type === 'badge'" class="grid gap-3 sm:grid-cols-2">
      <div>
        <label :for="fid('title')" :class="label">Naslov</label>
        <input :id="fid('title')" v-model="element.title" type="text" maxlength="40" placeholder="Proizvedeno u Srbiji" :class="[input, border('title')]">
        <p v-if="errors.title" class="mt-1 text-xs text-red-600">
          {{ errors.title }}
        </p>
      </div>
      <div>
        <label :for="fid('text')" :class="label">Tekst ispod</label>
        <input :id="fid('text')" v-model="element.text" type="text" maxlength="40" placeholder="od košnice do tegle" :class="[input, border('text')]">
      </div>
    </div>

    <!-- Lista prednosti -->
    <template v-else-if="element.type === 'checklist'">
      <div v-for="(_, i) in element.items" :key="i">
        <div class="flex items-center gap-2">
          <label :for="fid(`item-${i}`)" class="sr-only">{{ i + 1 }}. stavka</label>
          <Icon name="lucide:check" class="size-4 shrink-0 text-zinc-400" />
          <input :id="fid(`item-${i}`)" v-model="element.items[i]" type="text" maxlength="60" placeholder="Bez konzervansa" :class="[input, border(`items.${i}`)]">
          <button type="button" :class="removeButton" :disabled="element.items.length <= 1" :aria-label="`Ukloni ${i + 1}. stavku`" @click="element.items.splice(i, 1)">
            <Icon name="lucide:x" class="size-4" />
          </button>
        </div>
        <p v-if="errors[`items.${i}`]" class="mt-1 pl-6 text-xs text-red-600">
          {{ errors[`items.${i}`] }}
        </p>
      </div>
      <button type="button" :class="addButton" :disabled="element.items.length >= 5" @click="element.items.push('')">
        <Icon name="lucide:plus" class="size-3.5" /> Dodaj stavku
      </button>
    </template>

    <!-- Odbrojavanje -->
    <div v-else-if="element.type === 'countdown'" class="grid gap-3 sm:grid-cols-2">
      <div>
        <label :for="fid('label')" :class="label">Tekst iznad</label>
        <input :id="fid('label')" v-model="element.label" type="text" maxlength="40" placeholder="Akcija ističe za" :class="[input, border('label')]">
      </div>
      <div>
        <label :for="fid('end')" :class="label">Ističe</label>
        <input :id="fid('end')" v-model="localEnd" type="datetime-local" :class="[input, border('endsAt'), 'py-1.5']">
        <p class="mt-1 text-xs" :class="errors.endsAt ? 'text-red-600' : 'text-zinc-500'">
          {{ errors.endsAt || 'Posle ovog trenutka odbrojavanje se samo sakrije.' }}
        </p>
      </div>
    </div>

    <!-- Istaknuti proizvod -->
    <div v-else-if="element.type === 'product'" class="grid gap-3 sm:grid-cols-2">
      <div>
        <label :for="fid('product')" :class="label">Proizvod</label>
        <AdminSelect :id="fid('product')" v-model="element.productId" :options="productOptions" label="Proizvod" placeholder="Izaberite proizvod" :invalid="!!errors.productId" />
        <p class="mt-1 text-xs" :class="errors.productId ? 'text-red-600' : 'text-zinc-500'">
          {{ errors.productId || 'Samo aktivni proizvodi. Cena se uzima iz prodavnice (i akcijska).' }}
        </p>
      </div>
      <div>
        <label :for="fid('label')" :class="label">Natpis iznad</label>
        <input :id="fid('label')" v-model="element.label" type="text" maxlength="30" placeholder="Proizvod meseca" :class="[input, border('label')]">
      </div>
    </div>
  </div>
</template>
