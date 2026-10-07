<script setup lang="ts">
import type { AdminIngredient } from '#shared/types/catalog'
import { ingredientSchema } from '#shared/schemas/catalog'

const { data: ingredients, refresh } = await useFetch<AdminIngredient[]>('/api/admin/ingredients', {
  key: 'admin-ingredients',
  default: () => [],
})

// placeholder text from the seed counts as missing
const missing = (i: AdminIngredient) => !i.description || /^lorem ipsum/i.test(i.description)

type Filter = 'all' | 'missing' | 'unused'
const filter = ref<Filter>('all')
const search = ref('')
const tests: Record<Filter, (i: AdminIngredient) => boolean> = {
  all: () => true,
  missing,
  unused: i => !i.products.length,
}
const tabs = computed(() => ([
  { id: 'all', label: 'Svi' },
  { id: 'missing', label: 'Bez opisa' },
  { id: 'unused', label: 'Nekorišćeni' },
] as const).map(t => ({ ...t, count: ingredients.value.filter(tests[t.id]).length })))
const filterModel = computed({
  get: () => filter.value as string,
  set: (value: string) => {
    filter.value = value as Filter
    close()
  },
})

const visible = computed(() => {
  const q = search.value.trim().toLowerCase()
  return ingredients.value.filter(i => tests[filter.value](i) && (!q || i.name.toLowerCase().includes(q)))
})

// ----- one editor: id null = new, undefined = closed -----------------------------------
const editing = ref<number | null | undefined>(undefined)
const form = reactive({ name: '', description: '' })
const errors = ref<Record<string, string>>({})
const notice = ref('')
const busy = ref(false)

function open(ingredient?: AdminIngredient) {
  editing.value = ingredient ? ingredient.id : null
  form.name = ingredient?.name ?? search.value.trim()
  form.description = ingredient && !missing(ingredient) ? ingredient.description : ''
  errors.value = {}
  notice.value = ''
  nextTick(() => document.getElementById(ingredient ? 'ingredient-description' : 'ingredient-name')?.focus())
}
function close() {
  editing.value = undefined
}
const current = computed(() => ingredients.value.find(i => i.id === editing.value))

async function save(goNext = false) {
  const result = ingredientSchema.safeParse(form)
  errors.value = result.success ? {} : fieldErrors(result.error)
  if (!result.success) return

  // the next one in the list as it is now (under "Bez opisa" the saved one drops out after refresh)
  const index = visible.value.findIndex(i => i.id === editing.value)
  const next = goNext ? visible.value[index + 1] : undefined

  busy.value = true
  notice.value = ''
  try {
    if (editing.value) {
      await $fetch<unknown>(`/api/admin/ingredients/${editing.value}`, { method: 'PUT', body: result.data })
    }
    else {
      const created = await $fetch<{ existed: boolean }>('/api/admin/ingredients', { method: 'POST', body: result.data })
      if (created.existed) {
        errors.value = { name: 'Sastojak sa ovim nazivom već postoji.' }
        return
      }
    }
    await Promise.all([refresh(), refreshNuxtData('admin-catalog-options')])
    if (next) open(ingredients.value.find(i => i.id === next.id))
    else close()
  }
  catch (error) {
    const { fields, message } = apiError(error)
    errors.value = fields
    notice.value = message
  }
  finally {
    busy.value = false
  }
}

async function remove(ingredient: AdminIngredient) {
  const used = ingredient.products.length
    ? `\n\nKoristi se u: ${ingredient.products.join(', ')}. Biće uklonjen iz tih proizvoda.`
    : ''
  if (!window.confirm(`Obrisati sastojak „${ingredient.name}"?${used}`)) return
  busy.value = true
  notice.value = ''
  try {
    await $fetch<unknown>(`/api/admin/ingredients/${ingredient.id}`, { method: 'DELETE' })
    close()
    await Promise.all([refresh(), refreshNuxtData('admin-catalog-options')])
  }
  catch (error) {
    notice.value = apiError(error).message
  }
  finally {
    busy.value = false
  }
}

function onEditorKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
  else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') save(filter.value === 'missing')
}

const input = 'block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900'
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-3">
      <AdminListToolbar
        v-model:status="filterModel"
        v-model:search="search"
        :tabs="tabs"
        placeholder="Pretraži sastojke…"
        label="Pretraži sastojke"
        class="flex-1"
      />
      <button
        type="button"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        @click="open()"
      >
        <Icon name="lucide:plus" class="size-4" />
        Novi sastojak
      </button>
    </div>
    <p class="mt-3 text-xs text-zinc-500">
      Opis se prikazuje ispod naziva sastojka na stranici svakog proizvoda koji ga sadrži. Najbolje izgleda 1–2 kratke rečenice (do ~150 karaktera).
    </p>

    <p v-if="notice" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ notice }}
    </p>

    <div class="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <!-- new ingredient -->
      <template v-if="editing === null">
        <div class="border-b border-zinc-200 bg-zinc-50 px-4 py-4" @keydown="onEditorKeydown">
          <h3 class="text-sm font-semibold text-zinc-900">
            Novi sastojak
          </h3>
          <div class="mt-3">
            <label for="ingredient-name" class="mb-1 block text-xs font-medium text-zinc-600">Naziv</label>
            <input id="ingredient-name" v-model="form.name" type="text" maxlength="80" placeholder="Kopriva" :class="[input, errors.name ? 'border-red-500' : 'border-zinc-300']">
            <p v-if="errors.name" class="mt-1 text-xs text-red-600">
              {{ errors.name }}
            </p>
          </div>
          <div class="mt-3">
            <label for="ingredient-description" class="mb-1 block text-xs font-medium text-zinc-600">Opis</label>
            <textarea id="ingredient-description" v-model="form.description" rows="3" maxlength="300" :class="[input, errors.description ? 'border-red-500' : 'border-zinc-300', 'resize-y']" />
            <p class="mt-1 flex justify-between text-xs" :class="errors.description ? 'text-red-600' : 'text-zinc-500'">
              <span>{{ errors.description }}</span>
              <span>{{ form.description.length }}/300</span>
            </p>
          </div>
          <div class="mt-3 flex gap-2">
            <button type="button" :disabled="busy" class="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50" @click="save()">
              Dodaj
            </button>
            <button type="button" class="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50" @click="close">
              Otkaži
            </button>
          </div>
        </div>
      </template>

      <p v-if="!visible.length" class="py-12 text-center text-sm text-zinc-500">
        {{ ingredients.length ? (filter === 'missing' ? 'Svi sastojci imaju opis.' : 'Nema sastojaka za ovaj filter.') : 'Još nema sastojaka.' }}
      </p>

      <ul v-else class="divide-y divide-zinc-100">
        <li v-for="ingredient in visible" :key="ingredient.id">
          <button
            v-if="editing !== ingredient.id"
            type="button"
            class="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-zinc-50"
            @click="open(ingredient)"
          >
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-medium text-zinc-900">{{ ingredient.name }}</span>
              <span v-if="missing(ingredient)" class="mt-0.5 flex items-center gap-1 text-xs text-amber-600">
                <Icon name="lucide:triangle-alert" class="size-3 shrink-0" />
                {{ ingredient.description ? 'Privremeni tekst (Lorem ipsum)' : 'Nema opis' }}
              </span>
              <span v-else class="mt-0.5 block truncate text-xs text-zinc-500">{{ ingredient.description }}</span>
            </span>
            <span class="shrink-0 text-xs whitespace-nowrap" :class="ingredient.products.length ? 'text-zinc-500' : 'text-zinc-400 italic'">
              {{ ingredient.products.length ? `${ingredient.products.length} proizvoda` : 'ne koristi se' }}
            </span>
          </button>

          <!-- inline editor -->
          <div v-else class="bg-zinc-50 px-4 py-4" @keydown="onEditorKeydown">
            <div>
              <label for="ingredient-name" class="mb-1 block text-xs font-medium text-zinc-600">Naziv</label>
              <input id="ingredient-name" v-model="form.name" type="text" maxlength="80" :class="[input, errors.name ? 'border-red-500' : 'border-zinc-300']">
              <p v-if="errors.name" class="mt-1 text-xs text-red-600">
                {{ errors.name }}
              </p>
            </div>
            <div class="mt-3">
              <label for="ingredient-description" class="mb-1 block text-xs font-medium text-zinc-600">Opis</label>
              <textarea
                id="ingredient-description"
                v-model="form.description"
                rows="3"
                maxlength="300"
                :placeholder="current && missing(current) && current.description ? 'Trenutno: Lorem ipsum (privremeni tekst)' : 'Npr. Tradicionalno se koristi za…'"
                :class="[input, errors.description ? 'border-red-500' : 'border-zinc-300', 'resize-y']"
              />
              <p class="mt-1 flex justify-between text-xs" :class="errors.description ? 'text-red-600' : form.description.length > 150 ? 'text-amber-600' : 'text-zinc-500'">
                <span>{{ errors.description || (form.description.length > 150 ? 'Duži opis zauzima mnogo mesta na stranici proizvoda.' : 'Ctrl+Enter čuva, Esc zatvara.') }}</span>
                <span>{{ form.description.length }}/300</span>
              </p>
            </div>
            <p v-if="ingredient.products.length" class="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
              Koristi se u:
              <span v-for="name in ingredient.products" :key="name" class="rounded bg-white px-1.5 py-0.5 text-zinc-700 ring-1 ring-zinc-200">{{ name }}</span>
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <button type="button" :disabled="busy" class="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50" @click="save()">
                <Icon v-if="busy" name="lucide:loader-circle" class="size-4 animate-spin" />
                Sačuvaj
              </button>
              <button
                v-if="visible.findIndex(i => i.id === ingredient.id) < visible.length - 1"
                type="button"
                :disabled="busy"
                class="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
                @click="save(true)"
              >
                Sačuvaj i sledeći
                <Icon name="lucide:arrow-down" class="size-4" />
              </button>
              <button type="button" class="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100" @click="close">
                Otkaži
              </button>
              <button type="button" :disabled="busy" class="ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50" @click="remove(ingredient)">
                <Icon name="lucide:trash-2" class="size-4" />
                Obriši
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
