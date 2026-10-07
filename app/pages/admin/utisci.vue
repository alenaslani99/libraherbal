<script setup lang="ts">
import type { AdminTestimonial } from '#shared/types/engagement'
import { testimonialSchema } from '#shared/schemas/engagement'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Utisci kupaca' })

const { data: items, refresh } = await useFetch<AdminTestimonial[]>('/api/admin/testimonials', {
  key: 'admin-testimonials',
  default: () => [],
})

// the home page shows the first 3 active ones, in this order
const HOME_LIMIT = 3
const onHome = computed(() => new Set(items.value.filter(t => t.isActive).slice(0, HOME_LIMIT).map(t => t.id)))

const { page, pageSize, offset, items: pageItems, reveal } = usePagedList(items)

const notice = ref('')
const busy = ref(false)

async function after() {
  await Promise.all([refresh(), refreshNuxtData('home-testimonials')])
}

// ----- one form for "new" (id null) and "edit"; undefined = closed ----------------------
const editing = ref<number | null | undefined>(undefined)
const form = reactive({ author: '', text: '', rating: 5, isActive: true })
const errors = ref<Record<string, string>>({})

function open(item?: AdminTestimonial) {
  editing.value = item ? item.id : null
  form.author = item?.author ?? ''
  form.text = item?.text ?? ''
  form.rating = item?.rating ?? 5
  form.isActive = item?.isActive ?? true
  errors.value = {}
  notice.value = ''
}
const close = () => (editing.value = undefined)

async function save() {
  const result = testimonialSchema.safeParse(form)
  errors.value = result.success ? {} : fieldErrors(result.error)
  if (!result.success) return
  busy.value = true
  try {
    if (editing.value) await $fetch<unknown>(`/api/admin/testimonials/${editing.value}`, { method: 'PUT', body: result.data })
    else await $fetch<unknown>('/api/admin/testimonials', { method: 'POST', body: result.data })
    close()
    await after()
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

async function toggleActive(item: AdminTestimonial) {
  busy.value = true
  notice.value = ''
  try {
    await $fetch<unknown>(`/api/admin/testimonials/${item.id}`, {
      method: 'PUT',
      body: { author: item.author, text: item.text, rating: item.rating, isActive: !item.isActive },
    })
    await after()
  }
  catch (error) {
    notice.value = apiError(error).message
  }
  finally {
    busy.value = false
  }
}

async function remove(item: AdminTestimonial) {
  if (!window.confirm(`Obrisati utisak od „${item.author}"?`)) return
  busy.value = true
  notice.value = ''
  try {
    await $fetch<unknown>(`/api/admin/testimonials/${item.id}`, { method: 'DELETE' })
    if (editing.value === item.id) close()
    await after()
  }
  catch (error) {
    notice.value = apiError(error).message
  }
  finally {
    busy.value = false
  }
}

// order: moved in place, then saved as a whole
async function move(from: number, to: number) {
  if (to < 0 || to >= items.value.length || busy.value) return
  const list = [...items.value]
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item!)
  items.value = list
  reveal(to)
  busy.value = true
  notice.value = ''
  try {
    await $fetch<unknown>('/api/admin/testimonials/order', { method: 'PUT', body: { ids: list.map(t => t.id) } })
    await refreshNuxtData('home-testimonials')
  }
  catch (error) {
    notice.value = apiError(error).message
    await refresh()
  }
  finally {
    busy.value = false
  }
}

const input = 'block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900'
</script>

<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-zinc-900">
          Utisci kupaca
        </h1>
        <p class="mt-1 max-w-2xl text-sm text-zinc-500">
          „Uspešne priče" na početnoj strani. Prikazuju se prva {{ HOME_LIMIT }} aktivna utiska, ovim redosledom; ostali čekaju kao rezerva.
        </p>
      </div>
      <button
        v-if="editing !== null"
        type="button"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        @click="open()"
      >
        <Icon name="lucide:plus" class="size-4" />
        Novi utisak
      </button>
    </div>

    <p v-if="notice" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ notice }}
    </p>

    <!-- new / edit -->
    <form v-if="editing !== undefined" class="mt-6 rounded-lg border border-zinc-300 bg-white p-4 shadow-sm" novalidate @submit.prevent="save">
      <h2 class="text-sm font-semibold text-zinc-900">
        {{ editing ? 'Izmena utiska' : 'Novi utisak' }}
      </h2>
      <div class="mt-3 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label for="t-author" class="mb-1 block text-xs font-medium text-zinc-600">Ime kupca</label>
          <input id="t-author" v-model="form.author" type="text" maxlength="60" placeholder="Milica" :class="[input, errors.author ? 'border-red-500' : 'border-zinc-300']">
          <p class="mt-1 text-xs" :class="errors.author ? 'text-red-600' : 'text-zinc-500'">
            {{ errors.author || 'Samo ime ili ime i inicijal (Milica P.), uz saglasnost kupca.' }}
          </p>
        </div>
        <fieldset>
          <legend class="mb-1 block text-xs font-medium text-zinc-600">
            Ocena
          </legend>
          <div class="flex py-1.5" role="radiogroup" aria-label="Ocena">
            <label v-for="n in 5" :key="n" class="cursor-pointer p-0.5 has-[:focus-visible]:rounded has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-900">
              <input v-model="form.rating" type="radio" name="t-rating" :value="n" class="sr-only">
              <span class="sr-only">{{ n }} od 5</span>
              <Icon name="lucide:star" class="size-6 *:fill-current" :class="n <= form.rating ? 'text-amber-400' : 'text-zinc-200'" aria-hidden="true" />
            </label>
          </div>
        </fieldset>
      </div>
      <div class="mt-3">
        <label for="t-text" class="mb-1 block text-xs font-medium text-zinc-600">Utisak</label>
        <textarea id="t-text" v-model="form.text" rows="3" maxlength="400" :class="[input, errors.text ? 'border-red-500' : 'border-zinc-300', 'resize-y']" />
        <p class="mt-1 flex justify-between text-xs" :class="errors.text ? 'text-red-600' : form.text.length > 160 ? 'text-amber-600' : 'text-zinc-500'">
          <span>{{ errors.text || (form.text.length > 160 ? 'Duži utisci prave kartice nejednake visine.' : 'Kartice najlepše izgledaju sa 1–2 rečenice.') }}</span>
          <span>{{ form.text.length }}/400</span>
        </p>
      </div>
      <label class="mt-3 flex items-center gap-2 text-sm text-zinc-700">
        <input v-model="form.isActive" type="checkbox" class="size-4 rounded border-zinc-300 accent-zinc-900">
        Aktivan (može da se prikaže na početnoj)
      </label>
      <div class="mt-4 flex gap-2">
        <button type="submit" :disabled="busy" class="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50">
          <Icon v-if="busy" name="lucide:loader-circle" class="size-4 animate-spin" />
          {{ editing ? 'Sačuvaj' : 'Dodaj' }}
        </button>
        <button type="button" class="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50" @click="close">
          Otkaži
        </button>
      </div>
    </form>

    <div class="mt-6 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <p v-if="!items.length" class="py-12 text-center text-sm text-zinc-500">
        Još nema utisaka. Sekcija „Uspešne priče" se ne prikazuje dok ne dodate bar jedan.
      </p>
      <ol v-else class="divide-y divide-zinc-100">
        <li v-for="(t, n) in pageItems" :key="t.id" class="flex items-start gap-3 px-4 py-3" :class="{ 'bg-zinc-50': editing === t.id }">
          <span class="mt-0.5 w-6 text-xs text-zinc-400 tabular-nums">{{ offset + n + 1 }}.</span>
          <div class="min-w-0 flex-1" :class="{ 'opacity-50': !t.isActive }">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="text-sm font-medium text-zinc-900">{{ t.author }}</span>
              <span class="flex gap-0.5" role="img" :aria-label="`Ocena ${t.rating} od 5`">
                <Icon v-for="s in 5" :key="s" name="lucide:star" class="size-3 *:fill-current" :class="s <= t.rating ? 'text-amber-400' : 'text-zinc-200'" />
              </span>
              <span v-if="onHome.has(t.id)" class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Na početnoj</span>
              <span v-else-if="!t.isActive" class="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">Skriven</span>
              <span v-else class="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">Rezerva</span>
            </div>
            <p class="mt-1 text-sm text-zinc-600">
              „{{ t.text }}"
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              role="switch"
              :aria-checked="t.isActive"
              :aria-label="`${t.isActive ? 'Sakrij' : 'Prikaži'} utisak od ${t.author}`"
              :disabled="busy"
              class="relative mr-1 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50"
              :class="t.isActive ? 'bg-emerald-500' : 'bg-zinc-300'"
              @click="toggleActive(t)"
            >
              <span class="inline-block size-4 rounded-full bg-white shadow transition-transform" :class="t.isActive ? 'translate-x-4.5' : 'translate-x-0.5'" />
            </button>
            <button type="button" class="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30" :disabled="offset + n === 0 || busy" :aria-label="`Pomeri ${t.author} gore`" @click="move(offset + n, offset + n - 1)">
              <Icon name="lucide:chevron-up" class="size-4" />
            </button>
            <button type="button" class="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30" :disabled="offset + n === items.length - 1 || busy" :aria-label="`Pomeri ${t.author} dole`" @click="move(offset + n, offset + n + 1)">
              <Icon name="lucide:chevron-down" class="size-4" />
            </button>
            <button type="button" class="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" title="Uredi" :aria-label="`Uredi utisak od ${t.author}`" @click="open(t)">
              <Icon name="lucide:pencil" class="size-4" />
            </button>
            <button type="button" :disabled="busy" class="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" title="Obriši" :aria-label="`Obriši utisak od ${t.author}`" @click="remove(t)">
              <Icon name="lucide:trash-2" class="size-4" />
            </button>
          </div>
        </li>
      </ol>
    </div>

    <AdminPagination :page="page" :page-size="pageSize" :total="items.length" @change="p => (page = p)" />
  </div>
</template>
