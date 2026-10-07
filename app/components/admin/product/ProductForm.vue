<script setup lang="ts">
import type { AdminCatalogOptions, AdminProduct } from '#shared/types/product'
import type { AdminProductOption } from '#shared/types/blog'
import { adminProductSchema } from '#shared/schemas/product'

const props = defineProps<{
  // undefined = new product
  product?: AdminProduct
}>()

const [{ data: options }, { data: allProducts }] = await Promise.all([
  useFetch<AdminCatalogOptions>('/api/admin/catalog/options', {
    key: 'admin-catalog-options',
    default: () => ({ categories: [], purposes: [], ingredients: [] }),
  }),
  useFetch<AdminProductOption[]>('/api/admin/products/options', {
    key: 'admin-product-options',
    default: () => [],
  }),
])

// <input type="datetime-local"> works in the browser's time zone, the API in ISO (UTC)
function isoToLocal(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}
const localToIso = (value: string) => (value ? new Date(value).toISOString() : '')

function toForm(p?: AdminProduct) {
  return {
    name: p?.name ?? '',
    slug: p?.slug ?? '',
    categoryId: p?.categoryId ?? null as number | null,
    weightLabel: p?.weightLabel ?? '',
    isActive: p?.isActive ?? true,
    popular: p?.popular ?? false,
    description: p?.description ?? '',
    usageInstructions: p?.usageInstructions ?? '',
    nutritionInfo: p?.nutritionInfo ?? '',
    price: p?.price ?? '' as number | '',
    salePrice: p?.salePrice ?? '' as number | '',
    saleStarts: isoToLocal(p?.saleStartsAt ?? ''),
    saleEnds: isoToLocal(p?.saleEndsAt ?? ''),
    stock: p?.stock ?? '' as number | '',
    images: (p?.images ?? []).map(img => ({ ...img })),
    purposeIds: [...(p?.purposeIds ?? [])],
    ingredientIds: [...(p?.ingredientIds ?? [])],
    recommendedIds: [...(p?.recommendedIds ?? [])],
  }
}

const form = reactive(toForm(props.product))
const saved = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== saved.value)

function payload() {
  return {
    ...form,
    saleStarts: undefined,
    saleEnds: undefined,
    saleStartsAt: localToIso(form.saleStarts),
    saleEndsAt: localToIso(form.saleEnds),
  }
}

const errors = ref<Record<string, string>>({})
const notice = ref('')
const success = ref('')
const pending = ref(false)

// the URL follows the name until it is edited by hand (or the product already has one)
const slugTouched = ref(Boolean(props.product))
watch(() => form.name, (name) => {
  if (!slugTouched.value) form.slug = slugify(name)
})

// ----- price preview: what the customer sees right now ---------------------------------
const saleState = computed<'none' | 'running' | 'scheduled' | 'ended'>(() => {
  if (form.salePrice === '' || form.price === '') return 'none'
  const now = Date.now()
  if (form.saleStarts && new Date(form.saleStarts).getTime() > now) return 'scheduled'
  if (form.saleEnds && new Date(form.saleEnds).getTime() <= now) return 'ended'
  return 'running'
})
const discount = computed(() => (saleState.value === 'running' && form.price && form.salePrice !== ''
  ? Math.round((1 - Number(form.salePrice) / Number(form.price)) * 100)
  : 0))
function clearSale() {
  form.salePrice = ''
  form.saleStarts = ''
  form.saleEnds = ''
}

// ----- images: the first one is the main image -----------------------------------------
const newImage = ref('')
const imageError = ref('')
function addImage() {
  const src = newImage.value.trim()
  imageError.value = ''
  if (!src) return
  if (!src.startsWith('/') && !/^https:\/\/\S+$/.test(src)) {
    imageError.value = 'Adresa mora počinjati sa / ili https://'
    return
  }
  if (form.images.some(img => img.src === src)) {
    imageError.value = 'Ova slika je već dodata.'
    return
  }
  if (form.images.length >= 10) {
    imageError.value = 'Najviše 10 slika.'
    return
  }
  form.images.push({ src, alt: '' })
  newImage.value = ''
}
function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item!)
}
const broken = ref(new Set<string>())

// ----- ingredients: ordered, searchable, new ones can be added inline -----------------
const ingredientSearch = ref('')
const ingredientName = (id: number) => options.value.ingredients.find(i => i.id === id)?.name ?? `#${id}`
const ingredientMatches = computed(() => {
  const q = ingredientSearch.value.trim().toLowerCase()
  if (!q) return []
  return options.value.ingredients
    .filter(i => !form.ingredientIds.includes(i.id) && i.name.toLowerCase().includes(q))
    .slice(0, 8)
})
const canCreateIngredient = computed(() => {
  const q = ingredientSearch.value.trim().toLowerCase()
  return q.length > 0 && !options.value.ingredients.some(i => i.name.toLowerCase() === q)
})
function addIngredient(id: number) {
  if (!form.ingredientIds.includes(id) && form.ingredientIds.length < 30) form.ingredientIds.push(id)
  ingredientSearch.value = ''
}
const creatingIngredient = ref(false)
async function createIngredient() {
  const name = ingredientSearch.value.trim()
  if (!name || creatingIngredient.value) return
  creatingIngredient.value = true
  try {
    const created = await $fetch<{ id: number, name: string }>('/api/admin/ingredients', { method: 'POST', body: { name } })
    if (!options.value.ingredients.some(i => i.id === created.id)) {
      options.value.ingredients.push(created)
      options.value.ingredients.sort((a, b) => a.name.localeCompare(b.name, 'sr'))
    }
    addIngredient(created.id)
  }
  catch (error) {
    notice.value = apiError(error).message || Object.values(apiError(error).fields)[0] || 'Sastojak nije dodat.'
  }
  finally {
    creatingIngredient.value = false
  }
}
function onIngredientKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter') return
  event.preventDefault()
  if (ingredientMatches.value[0]) addIngredient(ingredientMatches.value[0].id)
  else if (canCreateIngredient.value) createIngredient()
}

// ----- purposes -------------------------------------------------------------------------
function togglePurpose(id: number) {
  const i = form.purposeIds.indexOf(id)
  if (i >= 0) form.purposeIds.splice(i, 1)
  else form.purposeIds.push(id)
}

// ----- recommended products: max 4, never the product itself ----------------------------
const productSearch = ref('')
const otherProducts = computed(() => allProducts.value.filter(p => p.id !== props.product?.id))
const filteredProducts = computed(() => {
  const q = productSearch.value.trim().toLowerCase()
  return q ? otherProducts.value.filter(p => p.name.toLowerCase().includes(q)) : otherProducts.value
})
const productName = (id: number) => allProducts.value.find(p => p.id === id)?.name ?? `#${id}`
function toggleRecommended(id: number) {
  const i = form.recommendedIds.indexOf(id)
  if (i >= 0) form.recommendedIds.splice(i, 1)
  else if (form.recommendedIds.length < 4) form.recommendedIds.push(id)
}

// ----- save / delete --------------------------------------------------------------------
async function save() {
  notice.value = ''
  success.value = ''
  if (pending.value) return
  addImage()

  const result = adminProductSchema.safeParse(payload())
  errors.value = result.success ? {} : fieldErrors(result.error)
  if (!result.success) {
    notice.value = 'Proverite označena polja.'
    return
  }

  pending.value = true
  try {
    if (props.product) {
      const fresh = await $fetch<AdminProduct>(`/api/admin/products/${props.product.id}`, { method: 'PUT', body: result.data })
      Object.assign(form, toForm(fresh))
      saved.value = JSON.stringify(form)
      success.value = 'Izmene su sačuvane.'
      await Promise.all([refreshNuxtData(`admin-product-${props.product.id}`), refreshNuxtData('admin-product-options')])
    }
    else {
      const { id } = await $fetch<{ id: number }>('/api/admin/products', { method: 'POST', body: result.data })
      saved.value = JSON.stringify(form)
      await refreshNuxtData('admin-product-options')
      await navigateTo({ path: `/admin/proizvodi/${id}`, query: { sacuvano: '1' } })
    }
  }
  catch (error) {
    const { fields, message } = apiError(error)
    errors.value = fields
    notice.value = message || 'Proverite označena polja.'
  }
  finally {
    pending.value = false
  }
}

const deleting = ref(false)
async function remove() {
  if (!props.product) return
  if (!window.confirm(`Obrisati proizvod „${props.product.name}"? Ovo ne može da se poništi.`)) return
  notice.value = ''
  deleting.value = true
  try {
    await $fetch(`/api/admin/products/${props.product.id}`, { method: 'DELETE' })
    saved.value = JSON.stringify(form)
    await navigateTo('/admin/proizvodi')
  }
  catch (error) {
    notice.value = apiError(error).message
  }
  finally {
    deleting.value = false
  }
}

// Ctrl+S saves; leaving with unsaved changes asks first
function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    save()
  }
}
function onBeforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value) event.preventDefault()
}
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})
onBeforeRouteLeave(() => {
  if (dirty.value && !pending.value && !deleting.value && !window.confirm('Imate nesačuvane izmene. Da li želite da napustite stranicu?')) return false
})

const route = useRoute()
if (route.query.sacuvano) success.value = 'Proizvod je napravljen.'

const input = 'block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900'
const inputBorder = (field: string) => errors.value[field] ? 'border-red-500' : 'border-zinc-300'
const label = 'mb-1.5 block text-sm font-medium text-zinc-700'
const card = 'rounded-lg border border-zinc-200 bg-white p-4'
const cardTitle = 'font-sans text-sm font-semibold text-zinc-900'
const iconButton = 'rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:hover:bg-transparent'
</script>

<template>
  <form novalidate @submit.prevent="save()">
    <!-- top bar: back, name, actions -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <NuxtLink to="/admin/proizvodi" class="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" aria-label="Nazad na listu">
        <Icon name="lucide:arrow-left" class="size-5" />
      </NuxtLink>
      <h1 class="min-w-0 flex-1 truncate font-sans text-2xl font-semibold tracking-tight text-zinc-900">
        {{ product ? form.name || 'Bez naziva' : 'Novi proizvod' }}
      </h1>
      <span v-if="dirty" class="text-xs text-amber-600">Nesačuvane izmene</span>
      <a
        v-if="product?.isActive"
        :href="`/proizvodi/${product.slug}`"
        target="_blank"
        class="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        <Icon name="lucide:external-link" class="size-4" />
        Na sajtu
      </a>
      <button
        type="submit"
        :disabled="pending"
        class="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        <Icon :name="pending ? 'lucide:loader-circle' : 'lucide:save'" class="size-4" :class="{ 'animate-spin': pending }" />
        {{ product ? 'Sačuvaj' : 'Napravi proizvod' }}
      </button>
    </div>

    <p v-if="notice" class="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      <Icon name="lucide:circle-alert" class="size-4 shrink-0" />
      {{ notice }}
    </p>
    <p v-else-if="success" class="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
      <Icon name="lucide:check" class="size-4 shrink-0" />
      {{ success }}
    </p>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <!-- main column -->
      <div class="min-w-0 space-y-6">
        <section :class="card" class="space-y-4">
          <h2 :class="cardTitle">
            Osnovno
          </h2>
          <div>
            <label for="product-name" :class="label">Naziv</label>
            <input id="product-name" v-model="form.name" type="text" maxlength="120" placeholder="Imuno Med" :class="[input, inputBorder('name'), 'text-base font-medium']">
            <p v-if="errors.name" class="mt-1 text-xs text-red-600">
              {{ errors.name }}
            </p>
          </div>
          <div>
            <label for="product-slug" :class="label">Adresa proizvoda</label>
            <div class="flex rounded-md shadow-xs">
              <span class="inline-flex items-center rounded-l-md border border-r-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500">/proizvodi/</span>
              <input
                id="product-slug"
                v-model="form.slug"
                type="text"
                maxlength="120"
                placeholder="imuno-med"
                :class="[input, inputBorder('slug'), 'rounded-l-none shadow-none']"
                @input="slugTouched = true"
              >
            </div>
            <p v-if="errors.slug" class="mt-1 text-xs text-red-600">
              {{ errors.slug }}
            </p>
            <p v-else-if="product && form.slug !== product.slug" class="mt-1 text-xs text-amber-600">
              Promena adrese kvari postojeće linkove i Google rezultate za ovaj proizvod.
            </p>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="product-category" :class="label">Kategorija</label>
              <AdminSelect
                id="product-category"
                v-model="form.categoryId"
                :options="options.categories.map(c => ({ value: c.id, label: c.name, hint: c.isActive ? '' : 'skrivena' }))"
                label="Kategorija"
                placeholder="Izaberite…"
                :invalid="Boolean(errors.categoryId)"
              />
              <p v-if="errors.categoryId" class="mt-1 text-xs text-red-600">
                {{ errors.categoryId }}
              </p>
            </div>
            <div>
              <label for="product-weight" :class="label">Pakovanje</label>
              <input id="product-weight" v-model="form.weightLabel" type="text" maxlength="30" placeholder="370ml, 50g…" :class="[input, inputBorder('weightLabel')]">
              <p class="mt-1 text-xs" :class="errors.weightLabel ? 'text-red-600' : 'text-zinc-500'">
                {{ errors.weightLabel || 'Prikazuje se na kartici: „MED • 370ml".' }}
              </p>
            </div>
          </div>
        </section>

        <section :class="card" class="space-y-4">
          <h2 :class="cardTitle">
            Opis
          </h2>
          <div>
            <label for="product-description" :class="label">Opis proizvoda</label>
            <textarea
              id="product-description"
              v-model="form.description"
              rows="5"
              maxlength="4000"
              placeholder="Šta je proizvod, od čega je i kome je namenjen. Bez tvrdnji o lečenju."
              :class="[input, inputBorder('description'), 'resize-y']"
            />
            <p class="mt-1 flex justify-between text-xs" :class="errors.description ? 'text-red-600' : 'text-zinc-500'">
              <span>{{ errors.description || 'Prve rečenice se koriste i kao opis na Google-u.' }}</span>
              <span>{{ form.description.length }}/4000</span>
            </p>
          </div>
          <div class="grid gap-4 lg:grid-cols-2">
            <div>
              <label for="product-usage" :class="label">Način upotrebe</label>
              <textarea id="product-usage" v-model="form.usageInstructions" rows="4" maxlength="2000" :class="[input, inputBorder('usageInstructions'), 'resize-y']" />
              <p v-if="errors.usageInstructions" class="mt-1 text-xs text-red-600">
                {{ errors.usageInstructions }}
              </p>
            </div>
            <div>
              <label for="product-nutrition" :class="label">Nutritivna vrednost</label>
              <textarea id="product-nutrition" v-model="form.nutritionInfo" rows="4" maxlength="2000" placeholder="Prazno = sekcija se ne prikazuje" :class="[input, inputBorder('nutritionInfo'), 'resize-y']" />
              <p v-if="errors.nutritionInfo" class="mt-1 text-xs text-red-600">
                {{ errors.nutritionInfo }}
              </p>
            </div>
          </div>
        </section>

        <section :class="card">
          <h2 class="flex items-center justify-between" :class="cardTitle">
            Slike
            <span class="text-xs font-normal text-zinc-500">{{ form.images.length }}/10</span>
          </h2>
          <p class="mt-1 text-xs text-zinc-500">
            Prva slika je glavna: kartica proizvoda, korpa i Google. Kvadratne slike izgledaju najbolje.
          </p>

          <ol v-if="form.images.length" class="mt-4 space-y-3">
            <li v-for="(image, i) in form.images" :key="image.src" class="flex gap-3 rounded-md border border-zinc-200 p-2">
              <div class="relative size-20 shrink-0 overflow-hidden rounded bg-zinc-100">
                <img
                  v-if="!broken.has(image.src)"
                  :src="image.src"
                  :alt="image.alt"
                  class="size-full object-cover"
                  referrerpolicy="no-referrer"
                  @error="broken.add(image.src)"
                >
                <div v-else class="flex size-full flex-col items-center justify-center gap-0.5 text-center text-[10px] text-red-600">
                  <Icon name="lucide:image-off" class="size-5" />
                  Ne učitava se
                </div>
                <span v-if="i === 0" class="absolute bottom-1 left-1 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-white">Glavna</span>
              </div>
              <div class="min-w-0 flex-1 space-y-1.5">
                <p class="truncate text-xs text-zinc-500" :title="image.src">
                  {{ image.src }}
                </p>
                <input
                  v-model="image.alt"
                  type="text"
                  maxlength="200"
                  :placeholder="`Opis slike (prazno = „${form.name || 'naziv proizvoda'}“)`"
                  :aria-label="`Opis slike ${i + 1}`"
                  :class="[input, 'border-zinc-300 py-1.5']"
                >
              </div>
              <div class="flex shrink-0 flex-col items-center gap-0.5">
                <button type="button" :class="iconButton" :disabled="i === 0" title="Pomeri gore" aria-label="Pomeri gore" @click="move(form.images, i, i - 1)">
                  <Icon name="lucide:chevron-up" class="size-4" />
                </button>
                <button type="button" :class="iconButton" :disabled="i === form.images.length - 1" title="Pomeri dole" aria-label="Pomeri dole" @click="move(form.images, i, i + 1)">
                  <Icon name="lucide:chevron-down" class="size-4" />
                </button>
                <button type="button" class="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600" title="Ukloni" aria-label="Ukloni sliku" @click="form.images.splice(i, 1)">
                  <Icon name="lucide:x" class="size-4" />
                </button>
              </div>
            </li>
          </ol>
          <div v-else class="mt-4 flex items-center gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <Icon name="lucide:image" class="size-4 shrink-0" />
            Bez slike proizvod na sajtu prikazuje prazno polje.
          </div>

          <div class="mt-4 flex gap-2">
            <input
              v-model="newImage"
              type="text"
              placeholder="/assets/img/imuno-med.jpg ili https://…"
              aria-label="Adresa nove slike"
              :class="[input, imageError || errors.images ? 'border-red-500' : 'border-zinc-300']"
              @keydown.enter.prevent="addImage"
            >
            <button type="button" class="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50" @click="addImage">
              <Icon name="lucide:plus" class="size-4" />
              Dodaj
            </button>
          </div>
          <p v-if="imageError || errors.images" class="mt-1 text-xs text-red-600">
            {{ imageError || errors.images }}
          </p>
        </section>

        <section :class="card">
          <h2 class="flex items-center justify-between" :class="cardTitle">
            Sastojci
            <span class="text-xs font-normal text-zinc-500">{{ form.ingredientIds.length }}</span>
          </h2>
          <p class="mt-1 text-xs text-zinc-500">
            Redosled je redosled na stranici proizvoda (01, 02, 03…). Novi sastojak se dodaje bez opisa.
          </p>

          <ol v-if="form.ingredientIds.length" class="mt-3 space-y-1">
            <li v-for="(id, i) in form.ingredientIds" :key="id" class="flex items-center gap-2 rounded bg-zinc-50 py-1 pr-1 pl-2 text-sm">
              <span class="w-6 text-xs text-zinc-400 tabular-nums">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="min-w-0 flex-1 truncate">{{ ingredientName(id) }}</span>
              <button type="button" :class="iconButton" :disabled="i === 0" :aria-label="`Pomeri ${ingredientName(id)} gore`" @click="move(form.ingredientIds, i, i - 1)">
                <Icon name="lucide:chevron-up" class="size-3.5" />
              </button>
              <button type="button" :class="iconButton" :disabled="i === form.ingredientIds.length - 1" :aria-label="`Pomeri ${ingredientName(id)} dole`" @click="move(form.ingredientIds, i, i + 1)">
                <Icon name="lucide:chevron-down" class="size-3.5" />
              </button>
              <button type="button" class="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600" :aria-label="`Ukloni ${ingredientName(id)}`" @click="form.ingredientIds.splice(i, 1)">
                <Icon name="lucide:x" class="size-3.5" />
              </button>
            </li>
          </ol>

          <div class="relative mt-3">
            <input
              v-model="ingredientSearch"
              type="search"
              placeholder="Dodaj sastojak: kopriva, đumbir…"
              aria-label="Pretraži sastojke"
              :class="[input, errors.ingredientIds ? 'border-red-500' : 'border-zinc-300']"
              @keydown="onIngredientKeydown"
            >
            <ul
              v-if="ingredientMatches.length || canCreateIngredient"
              class="absolute inset-x-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
            >
              <li v-for="match in ingredientMatches" :key="match.id">
                <button type="button" class="w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-50" @click="addIngredient(match.id)">
                  {{ match.name }}
                </button>
              </li>
              <li v-if="canCreateIngredient" :class="{ 'border-t border-zinc-100': ingredientMatches.length }">
                <button
                  type="button"
                  :disabled="creatingIngredient"
                  class="flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                  @click="createIngredient"
                >
                  <Icon :name="creatingIngredient ? 'lucide:loader-circle' : 'lucide:plus'" class="size-4" :class="{ 'animate-spin': creatingIngredient }" />
                  Novi sastojak „{{ ingredientSearch.trim() }}"
                </button>
              </li>
            </ul>
          </div>
          <p v-if="errors.ingredientIds" class="mt-1 text-xs text-red-600">
            {{ errors.ingredientIds }}
          </p>
        </section>
      </div>

      <!-- side column -->
      <div class="space-y-4">
        <section :class="card">
          <h2 :class="cardTitle">
            Vidljivost
          </h2>
          <label class="mt-3 flex items-start gap-2.5 text-sm text-zinc-700">
            <input v-model="form.isActive" type="checkbox" class="mt-0.5 size-4 rounded border-zinc-300 accent-zinc-900">
            <span>
              Prikazan u prodavnici
              <span class="block text-xs text-zinc-500">Skriven proizvod nema stranicu i ne može da se poruči.</span>
            </span>
          </label>
          <label class="mt-3 flex items-start gap-2.5 text-sm text-zinc-700">
            <input v-model="form.popular" type="checkbox" class="mt-0.5 size-4 rounded border-zinc-300 accent-zinc-900">
            <span>
              Popularni artikli
              <span class="block text-xs text-zinc-500">Na početnoj strani se prikazuju prva 4 označena proizvoda.</span>
            </span>
          </label>
          <dl v-if="product" class="mt-4 space-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
            <div class="flex justify-between">
              <dt>Prodato</dt>
              <dd class="text-zinc-900">
                {{ product.unitsSold }} kom.
              </dd>
            </div>
            <div class="flex justify-between">
              <dt>Izmenjeno</dt>
              <dd>{{ formatAdminDateTime(product.updatedAt) }}</dd>
            </div>
          </dl>
        </section>

        <section :class="card" class="space-y-3">
          <h2 :class="cardTitle">
            Cena
          </h2>
          <div>
            <label for="product-price" :class="label">Redovna cena</label>
            <div class="relative">
              <input id="product-price" v-model.number="form.price" type="number" min="1" step="1" inputmode="numeric" placeholder="1490" :class="[input, inputBorder('price'), 'pr-12']">
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-zinc-400">RSD</span>
            </div>
            <p v-if="errors.price" class="mt-1 text-xs text-red-600">
              {{ errors.price }}
            </p>
          </div>

          <div class="rounded-md border border-zinc-200 bg-zinc-50/60 p-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-zinc-700">Akcija</span>
              <button v-if="form.salePrice !== '' || form.saleStarts || form.saleEnds" type="button" class="text-xs text-zinc-500 hover:text-red-600" @click="clearSale">
                Ukloni akciju
              </button>
            </div>
            <div class="mt-2">
              <label for="product-sale-price" class="mb-1 block text-xs text-zinc-600">Akcijska cena</label>
              <div class="relative">
                <input id="product-sale-price" v-model.number="form.salePrice" type="number" min="1" step="1" inputmode="numeric" placeholder="Bez akcije" :class="[input, inputBorder('salePrice'), 'pr-12']">
                <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-zinc-400">RSD</span>
              </div>
              <p v-if="errors.salePrice" class="mt-1 text-xs text-red-600">
                {{ errors.salePrice }}
              </p>
            </div>
            <div class="mt-2 grid gap-2">
              <div>
                <label for="product-sale-start" class="mb-1 block text-xs text-zinc-600">Počinje</label>
                <input id="product-sale-start" v-model="form.saleStarts" type="datetime-local" :class="[input, inputBorder('saleStartsAt'), 'py-1.5']">
              </div>
              <div>
                <label for="product-sale-end" class="mb-1 block text-xs text-zinc-600">Završava se</label>
                <input id="product-sale-end" v-model="form.saleEnds" type="datetime-local" :class="[input, inputBorder('saleEndsAt'), 'py-1.5']">
              </div>
              <p class="text-xs" :class="errors.saleEndsAt || errors.saleStartsAt ? 'text-red-600' : 'text-zinc-500'">
                {{ errors.saleEndsAt || errors.saleStartsAt || 'Prazno = odmah / bez kraja. Kraj se na sajtu prikazuje kao odbrojavanje.' }}
              </p>
            </div>
          </div>

          <!-- what the shop shows right now -->
          <div v-if="form.price !== ''" class="rounded-md bg-zinc-900 px-3 py-2.5 text-white">
            <p class="text-[11px] uppercase tracking-wide text-white/60">
              Kupac sada vidi
            </p>
            <p class="mt-0.5 flex flex-wrap items-baseline gap-x-2">
              <span class="text-lg font-semibold">{{ saleState === 'running' ? form.salePrice : form.price }},00 RSD</span>
              <span v-if="saleState === 'running'" class="text-sm text-white/50 line-through">{{ form.price }},00</span>
              <span v-if="discount" class="rounded bg-amber-400 px-1.5 py-0.5 text-xs font-semibold text-zinc-900">-{{ discount }}%</span>
            </p>
            <p v-if="saleState === 'scheduled'" class="mt-1 text-xs text-amber-300">
              Akcija još nije počela.
            </p>
            <p v-else-if="saleState === 'ended'" class="mt-1 text-xs text-amber-300">
              Akcija je istekla.
            </p>
          </div>
          <p v-if="product" class="text-xs text-zinc-500">
            Izmena cene ne menja već primljene porudžbine.
          </p>
        </section>

        <section :class="card">
          <label for="product-stock" :class="cardTitle">Zalihe</label>
          <div class="relative mt-3">
            <input id="product-stock" v-model.number="form.stock" type="number" min="0" step="1" inputmode="numeric" placeholder="50" :class="[input, inputBorder('stock'), 'pr-12']">
            <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-zinc-400">kom.</span>
          </div>
          <p v-if="errors.stock" class="mt-1 text-xs text-red-600">
            {{ errors.stock }}
          </p>
          <p v-else-if="form.stock === 0" class="mt-1 flex items-center gap-1 text-xs text-amber-600">
            <Icon name="lucide:triangle-alert" class="size-3.5" />
            Na sajtu piše „Nema na stanju" i dugme za korpu je isključeno.
          </p>
          <p v-else class="mt-1 text-xs text-zinc-500">
            0 = nema na stanju. Porudžbine za sada ne umanjuju zalihe.
          </p>
        </section>

        <section :class="card">
          <h2 :class="cardTitle">
            Svrha
          </h2>
          <p class="mt-1 text-xs text-zinc-500">
            Filter „Svrha" na /proizvodi i natpis iznad naziva proizvoda.
          </p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <button
              v-for="p in options.purposes"
              :key="p.id"
              type="button"
              :aria-pressed="form.purposeIds.includes(p.id)"
              class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
              :class="form.purposeIds.includes(p.id) ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400'"
              @click="togglePurpose(p.id)"
            >
              <Icon v-if="form.purposeIds.includes(p.id)" name="lucide:check" class="size-3" />
              {{ p.name }}
            </button>
          </div>
          <p v-if="errors.purposeIds" class="mt-1 text-xs text-red-600">
            {{ errors.purposeIds }}
          </p>
        </section>

        <section :class="card">
          <h2 class="flex items-center justify-between" :class="cardTitle">
            Preporučeni proizvodi
            <span class="text-xs font-normal text-zinc-500">{{ form.recommendedIds.length }}/4</span>
          </h2>
          <p class="mt-1 text-xs text-zinc-500">
            Ispod proizvoda. Prazna mesta se popunjavaju najprodavanijim iz iste kategorije.
          </p>
          <ol v-if="form.recommendedIds.length" class="mt-3 space-y-1">
            <li v-for="(id, i) in form.recommendedIds" :key="id" class="flex items-center gap-2 rounded bg-zinc-50 px-2 py-1 text-sm">
              <span class="text-xs text-zinc-400">{{ i + 1 }}.</span>
              <span class="min-w-0 flex-1 truncate">{{ productName(id) }}</span>
              <button type="button" class="rounded p-0.5 text-zinc-400 hover:text-zinc-900" :aria-label="`Ukloni ${productName(id)}`" @click="toggleRecommended(id)">
                <Icon name="lucide:x" class="size-3.5" />
              </button>
            </li>
          </ol>
          <input v-model="productSearch" type="search" placeholder="Pretraži proizvode…" aria-label="Pretraži proizvode" :class="[input, 'mt-3 border-zinc-300']">
          <ul class="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
            <li v-for="p in filteredProducts" :key="p.id">
              <label class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-zinc-50" :class="{ 'opacity-50': !form.recommendedIds.includes(p.id) && form.recommendedIds.length >= 4 }">
                <input
                  type="checkbox"
                  :checked="form.recommendedIds.includes(p.id)"
                  :disabled="!form.recommendedIds.includes(p.id) && form.recommendedIds.length >= 4"
                  class="size-4 rounded border-zinc-300 accent-zinc-900"
                  @change="toggleRecommended(p.id)"
                >
                <span class="min-w-0 flex-1 truncate">{{ p.name }}</span>
                <span v-if="!p.isActive" class="text-[10px] text-amber-600">skriven</span>
                <span class="text-xs text-zinc-400">{{ p.weight }}</span>
              </label>
            </li>
          </ul>
          <p v-if="errors.recommendedIds" class="mt-1 text-xs text-red-600">
            {{ errors.recommendedIds }}
          </p>
        </section>

        <section v-if="product" class="rounded-lg border border-red-200 bg-white p-4">
          <h2 class="font-sans text-sm font-semibold text-red-700">
            Brisanje
          </h2>
          <p class="mt-1 text-xs text-zinc-500">
            {{ product.unitsSold
              ? 'Proizvod je već poručivan, pa ne može da se obriše. Isključite „Prikazan u prodavnici" da ga sakrijete.'
              : 'Trajno briše proizvod, cene i slike. Proizvod koji je već poručivan može samo da se sakrije.' }}
          </p>
          <button
            v-if="!product.unitsSold"
            type="button"
            :disabled="deleting"
            class="mt-3 inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            @click="remove"
          >
            <Icon :name="deleting ? 'lucide:loader-circle' : 'lucide:trash-2'" class="size-4" :class="{ 'animate-spin': deleting }" />
            Obriši proizvod
          </button>
        </section>
      </div>
    </div>
  </form>
</template>
