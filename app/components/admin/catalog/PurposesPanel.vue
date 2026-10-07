<script setup lang="ts">
import type { AdminPurpose } from '#shared/types/catalog'
import { purposeSchema } from '#shared/schemas/catalog'

const { data: purposes, refresh } = await useFetch<AdminPurpose[]>('/api/admin/catalog/purposes', {
  key: 'admin-purposes',
  default: () => [],
})

const { page, pageSize, offset, items: pageItems, reveal } = usePagedList(purposes)

const notice = ref('')
const busy = ref(false)

async function after() {
  await Promise.all([refresh(), refreshNuxtData('admin-catalog-options')])
}

// ----- one form for "new" (id null) and "edit" -----------------------------------------
const editing = ref<number | null | undefined>(undefined) // undefined = closed, null = new
const form = reactive({ name: '', slug: '' })
const errors = ref<Record<string, string>>({})
const slugTouched = ref(false)

function open(purpose?: AdminPurpose) {
  editing.value = purpose ? purpose.id : null
  form.name = purpose?.name ?? ''
  form.slug = purpose?.slug ?? ''
  slugTouched.value = Boolean(purpose)
  errors.value = {}
  notice.value = ''
}
function close() {
  editing.value = undefined
}
watch(() => form.name, (name) => {
  if (!slugTouched.value) form.slug = slugify(name).slice(0, 60)
})

async function save() {
  const result = purposeSchema.safeParse(form)
  errors.value = result.success ? {} : fieldErrors(result.error)
  if (!result.success) return

  busy.value = true
  try {
    if (editing.value) await $fetch<unknown>(`/api/admin/catalog/purposes/${editing.value}`, { method: 'PUT', body: result.data })
    else await $fetch<unknown>('/api/admin/catalog/purposes', { method: 'POST', body: result.data })
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

async function remove(purpose: AdminPurpose) {
  const used = purpose.productCount
    ? `\n\nDodeljena je proizvodima: ${purpose.productCount}. Biće uklonjena sa njih.`
    : ''
  if (!window.confirm(`Obrisati svrhu „${purpose.name}"?${used}`)) return
  notice.value = ''
  busy.value = true
  try {
    await $fetch<unknown>(`/api/admin/catalog/purposes/${purpose.id}`, { method: 'DELETE' })
    if (editing.value === purpose.id) close()
    await after()
  }
  catch (error) {
    notice.value = apiError(error).message
  }
  finally {
    busy.value = false
  }
}

// ----- order: moved in place, then saved as a whole --------------------------------------
async function move(from: number, to: number) {
  if (to < 0 || to >= purposes.value.length || busy.value) return
  const list = [...purposes.value]
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item!)
  purposes.value = list
  reveal(to)
  busy.value = true
  notice.value = ''
  try {
    await $fetch<unknown>('/api/admin/catalog/purposes/order', { method: 'PUT', body: { ids: list.map(p => p.id) } })
    await refreshNuxtData('admin-catalog-options')
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
      <p class="max-w-2xl text-sm text-zinc-600">
        Filter „Svrha" na /proizvodi. Redosled ovde je redosled u filteru, a prva svrha proizvoda
        je natpis iznad njegovog naziva („MED • IMUNITET").
      </p>
      <button
        v-if="editing !== null"
        type="button"
        class="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        @click="open()"
      >
        <Icon name="lucide:plus" class="size-4" />
        Nova svrha
      </button>
    </div>

    <p v-if="notice" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ notice }}
    </p>

    <!-- new / edit form -->
    <form
      v-if="editing !== undefined"
      class="mt-4 rounded-lg border border-zinc-300 bg-white p-4 shadow-sm"
      novalidate
      @submit.prevent="save"
    >
      <h3 class="text-sm font-semibold text-zinc-900">
        {{ editing ? 'Izmena svrhe' : 'Nova svrha' }}
      </h3>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label for="purpose-name" class="mb-1 block text-xs font-medium text-zinc-600">Naziv</label>
          <input id="purpose-name" v-model="form.name" type="text" maxlength="40" placeholder="Imunitet" :class="[input, errors.name ? 'border-red-500' : 'border-zinc-300']">
          <p v-if="errors.name" class="mt-1 text-xs text-red-600">
            {{ errors.name }}
          </p>
        </div>
        <div>
          <label for="purpose-slug" class="mb-1 block text-xs font-medium text-zinc-600">Adresa u filteru</label>
          <div class="flex">
            <span class="inline-flex items-center rounded-l-md border border-r-0 border-zinc-300 bg-zinc-50 px-2.5 text-xs text-zinc-500">?kategorija=</span>
            <input
              id="purpose-slug"
              v-model="form.slug"
              type="text"
              maxlength="60"
              placeholder="imunitet"
              :class="[input, errors.slug ? 'border-red-500' : 'border-zinc-300', 'rounded-l-none']"
              @input="slugTouched = true"
            >
          </div>
          <p v-if="errors.slug" class="mt-1 text-xs text-red-600">
            {{ errors.slug }}
          </p>
          <p v-else-if="editing && form.slug !== purposes.find(p => p.id === editing)?.slug" class="mt-1 text-xs text-amber-600">
            Stari linkovi sa ovim filterom više neće raditi.
          </p>
        </div>
      </div>
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

    <div class="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <p v-if="!purposes.length" class="py-12 text-center text-sm text-zinc-500">
        Još nema svrha.
      </p>
      <ol v-else class="divide-y divide-zinc-100">
        <li v-for="(p, n) in pageItems" :key="p.id" class="flex items-center gap-3 px-4 py-2.5 text-sm" :class="{ 'bg-zinc-50': editing === p.id }">
          <span class="w-6 text-xs text-zinc-400 tabular-nums">{{ offset + n + 1 }}.</span>
          <div class="min-w-0 flex-1">
            <span class="font-medium text-zinc-900">{{ p.name }}</span>
            <span class="ml-2 text-xs text-zinc-500">?kategorija={{ p.slug }}</span>
          </div>
          <span class="hidden text-xs text-zinc-500 sm:inline">{{ p.productCount }} proizvoda</span>
          <div class="flex items-center gap-0.5">
            <button type="button" class="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30" :disabled="offset + n === 0 || busy" :aria-label="`Pomeri ${p.name} gore`" @click="move(offset + n, offset + n - 1)">
              <Icon name="lucide:chevron-up" class="size-4" />
            </button>
            <button type="button" class="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30" :disabled="offset + n === purposes.length - 1 || busy" :aria-label="`Pomeri ${p.name} dole`" @click="move(offset + n, offset + n + 1)">
              <Icon name="lucide:chevron-down" class="size-4" />
            </button>
            <button type="button" class="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" title="Uredi" :aria-label="`Uredi ${p.name}`" @click="open(p)">
              <Icon name="lucide:pencil" class="size-4" />
            </button>
            <button type="button" :disabled="busy" class="rounded p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50" title="Obriši" :aria-label="`Obriši ${p.name}`" @click="remove(p)">
              <Icon name="lucide:trash-2" class="size-4" />
            </button>
          </div>
        </li>
      </ol>
    </div>

    <AdminPagination :page="page" :page-size="pageSize" :total="purposes.length" @change="p => (page = p)" />
  </div>
</template>
