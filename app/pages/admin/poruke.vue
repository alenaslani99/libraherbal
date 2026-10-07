<script setup lang="ts">
import type { AdminContactMessage, AdminContactMessageList, ContactMessageStatus } from '#shared/types/contact'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Poruke' })

const { status, q, page, search, setQuery } = useAdminListQuery()

const { data, status: fetchStatus, error, refresh } = await useFetch<AdminContactMessageList>('/api/admin/messages', {
  key: 'admin-messages',
  query: { status, q, page },
})

const statuses: Record<ContactMessageStatus, { label: string, class: string }> = {
  new: { label: 'Nova', class: 'bg-amber-100 text-amber-800' },
  read: { label: 'Pročitana', class: 'bg-zinc-100 text-zinc-600' },
  answered: { label: 'Odgovoreno', class: 'bg-emerald-100 text-emerald-800' },
}

const STATUS_TABS: (ContactMessageStatus | '')[] = ['', 'new', 'read', 'answered']
const tabs = computed(() => STATUS_TABS.map(id => ({
  id,
  label: id ? statuses[id].label : 'Sve',
  count: data.value?.counts[id || 'all'] ?? 0,
})))

const statusModel = computed({
  get: () => status.value,
  set: value => setQuery({ status: value, page: 1 }),
})

const notice = ref('')
const busy = ref<number | null>(null)

async function run(message: AdminContactMessage, action: () => Promise<unknown>) {
  notice.value = ''
  busy.value = message.id
  try {
    await action()
    await refresh()
  }
  catch (e) {
    notice.value = apiError(e).message || 'Došlo je do greške.'
  }
  finally {
    busy.value = null
  }
}

function setStatus(message: AdminContactMessage, next: ContactMessageStatus) {
  return run(message, () => $fetch<unknown>(`/api/admin/messages/${message.id}`, { method: 'PATCH', body: { status: next } }))
}

function remove(message: AdminContactMessage) {
  if (!window.confirm(`Obrisati poruku od „${message.name}"? Ovo ne može da se poništi.`)) return
  if (open.value === message.id) open.value = null
  return run(message, () => $fetch<unknown>(`/api/admin/messages/${message.id}`, { method: 'DELETE' }))
}

// one message open at a time; opening a new one marks it as read. Updated in place, not
// refetched, so it stays open even under the "Nova" filter.
const open = ref<number | null>(null)
async function toggle(message: AdminContactMessage) {
  open.value = open.value === message.id ? null : message.id
  if (open.value !== message.id || message.status !== 'new') return
  try {
    await $fetch(`/api/admin/messages/${message.id}`, { method: 'PATCH', body: { status: 'read' } })
    message.status = 'read'
    if (data.value) {
      data.value.counts.new--
      data.value.counts.read++
    }
  }
  catch (e) {
    notice.value = apiError(e).message || 'Došlo je do greške.'
  }
}

// "Odgovori" opens the mail app with the original message quoted
function replyHref(message: AdminContactMessage) {
  const quoted = message.message.split('\n').map(line => `> ${line}`).join('\n')
  const subject = 'Re: Vaša poruka – Libra Herbal'
  const body = `Poštovani/a ${message.name},\n\n\n\n${quoted}`
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
</script>

<template>
  <div>
    <div>
      <h1 class="font-sans text-2xl font-semibold tracking-tight text-zinc-900">
        Poruke
      </h1>
      <p class="mt-1 text-sm text-zinc-500">
        Poruke poslate preko forme na stranici /kontakt. Otvaranjem se poruka označava kao pročitana.
      </p>
    </div>

    <AdminListToolbar
      v-model:status="statusModel"
      v-model:search="search"
      :tabs="tabs"
      placeholder="Ime, email, telefon ili tekst…"
      label="Pretraži poruke"
      class="mt-6"
    />

    <p v-if="notice || error" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ notice || apiError(error).message || 'Poruke nisu učitane.' }}
    </p>

    <div class="mt-4 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div v-if="fetchStatus === 'pending' && !data" class="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
        <Icon name="lucide:loader-circle" class="size-4 animate-spin" />
        Učitavanje…
      </div>

      <div v-else-if="!data?.messages.length" class="py-16 text-center">
        <Icon name="lucide:mail" class="mx-auto size-8 text-zinc-300" />
        <p class="mt-2 text-sm text-zinc-500">
          {{ q || status ? 'Nema poruka za ovaj filter.' : 'Još nema poruka.' }}
        </p>
      </div>

      <ul v-else class="divide-y divide-zinc-100">
        <li v-for="message in data.messages" :key="message.id">
          <button
            type="button"
            class="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-zinc-50"
            :aria-expanded="open === message.id"
            :aria-controls="`message-${message.id}`"
            @click="toggle(message)"
          >
            <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="message.status === 'new' ? 'bg-amber-500' : 'bg-transparent'" aria-hidden="true" />
            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span class="text-sm text-zinc-900" :class="{ 'font-semibold': message.status === 'new' }">{{ message.name }}</span>
                <span class="truncate text-xs text-zinc-500">{{ message.email }}</span>
              </span>
              <span v-if="open !== message.id" class="mt-0.5 block truncate text-sm text-zinc-600">{{ message.message }}</span>
            </span>
            <span class="flex shrink-0 flex-col items-end gap-1">
              <span class="text-xs whitespace-nowrap text-zinc-500">{{ formatAdminDateTime(message.createdAt) }}</span>
              <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statuses[message.status].class">
                {{ statuses[message.status].label }}
              </span>
            </span>
          </button>

          <div v-if="open === message.id" :id="`message-${message.id}`" class="border-t border-zinc-100 bg-zinc-50/60 px-4 py-4 sm:pl-9">
            <p class="text-sm whitespace-pre-line text-zinc-900">
              {{ message.message }}
            </p>

            <div class="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-zinc-600">
              <a :href="`mailto:${message.email}`" class="flex items-center gap-1.5 hover:text-zinc-900">
                <Icon name="lucide:mail" class="size-4 text-zinc-400" />
                {{ message.email }}
              </a>
              <a v-if="message.phone" :href="`tel:${message.phone.replace(/[^\d+]/g, '')}`" class="flex items-center gap-1.5 hover:text-zinc-900">
                <Icon name="lucide:phone" class="size-4 text-zinc-400" />
                {{ message.phone }}
              </a>
              <span class="flex items-center gap-1.5">
                <Icon name="lucide:user" class="size-4 text-zinc-400" />
                {{ message.registered ? 'Registrovan kupac' : 'Poslato bez naloga' }}
              </span>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <a
                :href="replyHref(message)"
                class="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                <Icon name="lucide:reply" class="size-4" />
                Odgovori emailom
              </a>
              <button
                v-if="message.status !== 'answered'"
                type="button"
                :disabled="busy === message.id"
                class="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
                @click="setStatus(message, 'answered')"
              >
                <Icon name="lucide:check" class="size-4" />
                Označi kao odgovoreno
              </button>
              <button
                v-if="message.status !== 'new'"
                type="button"
                :disabled="busy === message.id"
                class="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50"
                @click="setStatus(message, 'new')"
              >
                <Icon name="lucide:mail-warning" class="size-4" />
                Označi kao novu
              </button>
              <button
                type="button"
                :disabled="busy === message.id"
                class="ml-auto inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                @click="remove(message)"
              >
                <Icon name="lucide:trash-2" class="size-4" />
                Obriši
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <AdminPagination v-if="data" :page="page" :page-size="data.pageSize" :total="data.total" @change="p => setQuery({ page: p })" />
  </div>
</template>
