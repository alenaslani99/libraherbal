<script setup lang="ts">
import type { AdminOrder, OrderStatus } from '#shared/types/order'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const route = useRoute()
const id = String(route.params.id)

const { data: order, error } = await useFetch<AdminOrder>(`/api/admin/orders/${encodeURIComponent(id)}`, { key: `admin-order-${id}` })

if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 500, message: 'Porudžbina nije pronađena.', fatal: true })
}

useSeoMeta({ title: () => order.value?.orderNumber ?? 'Porudžbina' })

// back to the list with the filters it had (the list keeps them in its URL)
const router = useRouter()
const backTo = computed(() => {
  const from = router.options.history.state.back
  return typeof from === 'string' && from.startsWith('/admin/porudzbine') ? from : '/admin/porudzbine'
})

const FLOW = ['received', 'preparing', 'in_transit', 'delivered'] as const
const STATUSES: OrderStatus[] = [...FLOW, 'cancelled']

const note = ref(order.value!.adminNote)
watch(order, (o) => {
  if (o) note.value = o.adminNote
})

const saving = ref<'status' | 'note' | null>(null)
// the status being saved, for its spinner
const pendingStatus = ref<OrderStatus | null>(null)
const notice = ref('')
const success = ref('')

// Status radios save on click. A declined "cancel?" puts the radio back on the current status.
async function pickStatus(event: Event, status: OrderStatus) {
  const radio = event.target as HTMLInputElement
  if (status === order.value!.status) return
  if (status === 'cancelled' && !window.confirm(`Otkazati porudžbinu ${order.value!.orderNumber}?`)) {
    radio.checked = false
    document.querySelector<HTMLInputElement>(`input[name="order-status"][value="${order.value!.status}"]`)!.checked = true
    return
  }
  pendingStatus.value = status
  await update({ status }, 'status')
  pendingStatus.value = null
  // failed: show the saved status again
  document.querySelector<HTMLInputElement>(`input[name="order-status"][value="${order.value!.status}"]`)!.checked = true
}

async function update(body: { status?: OrderStatus, adminNote?: string }, what: 'status' | 'note') {
  notice.value = ''
  success.value = ''
  saving.value = what
  try {
    order.value = await $fetch<AdminOrder>(`/api/admin/orders/${order.value!.id}`, { method: 'PATCH', body })
    success.value = what === 'status' ? `Status je promenjen u „${orderStatuses[order.value.status].label}".` : 'Beleška je sačuvana.'
  }
  catch (e) {
    const { fields, message } = apiError(e)
    notice.value = message || Object.values(fields)[0] || 'Došlo je do greške.'
  }
  finally {
    saving.value = null
  }
}

const noteDirty = computed(() => note.value.trim() !== order.value?.adminNote)

const savings = computed(() => order.value?.items.reduce((sum, item) => sum + (item.regularPrice - item.unitPrice) * item.quantity, 0) ?? 0)
</script>

<template>
  <div v-if="order">
    <NuxtLink :to="backTo" class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
      <Icon name="lucide:arrow-left" class="size-4" />
      Porudžbine
    </NuxtLink>

    <div class="mt-3 flex flex-wrap items-center gap-3">
      <h1 class="font-sans text-2xl font-semibold tracking-tight text-zinc-900">
        {{ order.orderNumber }}
      </h1>
      <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="adminOrderStatusClass[order.status]">
        {{ orderStatuses[order.status].label }}
      </span>
    </div>
    <p class="mt-1 text-sm text-zinc-500">
      Primljena {{ formatAdminDateTime(order.dates.received!) }} · Plaćanje pouzećem ·
      {{ order.userId ? 'Registrovan kupac' : 'Kupovina bez naloga' }}
    </p>

    <p v-if="notice" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ notice }}
    </p>
    <p v-if="success" class="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
      {{ success }}
    </p>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <!-- items -->
        <section class="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <h2 class="border-b border-zinc-200 px-4 py-3 text-sm font-semibold">
            Proizvodi
          </h2>
          <table class="w-full text-left text-sm">
            <thead class="border-b border-zinc-100 bg-zinc-50 text-xs font-medium text-zinc-500">
              <tr>
                <th scope="col" class="px-4 py-2">
                  Naziv
                </th>
                <th scope="col" class="px-4 py-2 text-right">
                  Cena
                </th>
                <th scope="col" class="px-4 py-2 text-right">
                  Kol.
                </th>
                <th scope="col" class="px-4 py-2 text-right">
                  Ukupno
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr v-for="(item, i) in order.items" :key="i">
                <td class="px-4 py-3 text-zinc-900">
                  {{ item.name }}
                  <span v-if="item.productId === null" class="block text-xs text-zinc-400">Proizvod više ne postoji u katalogu</span>
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap text-zinc-600">
                  {{ item.unitPrice }},00
                  <span v-if="item.regularPrice > item.unitPrice" class="block text-xs text-zinc-400 line-through">{{ item.regularPrice }},00</span>
                </td>
                <td class="px-4 py-3 text-right text-zinc-600">
                  {{ item.quantity }}
                </td>
                <td class="px-4 py-3 text-right font-medium whitespace-nowrap text-zinc-900">
                  {{ item.lineTotal }},00
                </td>
              </tr>
            </tbody>
          </table>
          <dl class="space-y-1.5 border-t border-zinc-200 px-4 py-3 text-sm">
            <div class="flex justify-between text-zinc-600">
              <dt>Međuzbir</dt>
              <dd>{{ order.subtotal }},00 RSD</dd>
            </div>
            <div v-if="savings > 0" class="flex justify-between text-zinc-500">
              <dt>Ušteda na akcijama</dt>
              <dd>−{{ savings }},00 RSD</dd>
            </div>
            <div class="flex justify-between text-zinc-600">
              <dt>Dostava</dt>
              <dd>{{ order.shippingCost ? `${order.shippingCost},00 RSD` : 'Besplatna' }}</dd>
            </div>
            <div class="flex justify-between border-t border-zinc-100 pt-2 text-base font-semibold text-zinc-900">
              <dt>Za naplatu pouzećem</dt>
              <dd>{{ order.total }},00 RSD</dd>
            </div>
          </dl>
        </section>

        <!-- customer + address -->
        <section class="rounded-lg border border-zinc-200 bg-white">
          <h2 class="border-b border-zinc-200 px-4 py-3 text-sm font-semibold">
            Kupac i dostava
          </h2>
          <div class="grid gap-5 p-4 text-sm sm:grid-cols-2">
            <div class="space-y-1.5">
              <p class="font-medium text-zinc-900">
                {{ order.shipping.firstName }} {{ order.shipping.lastName }}
              </p>
              <a :href="`mailto:${order.shipping.email}`" class="flex items-center gap-2 text-zinc-600 hover:text-zinc-900">
                <Icon name="lucide:mail" class="size-4 shrink-0 text-zinc-400" />
                <span class="truncate">{{ order.shipping.email }}</span>
              </a>
              <a :href="`tel:${order.shipping.phone.replace(/[^\d+]/g, '')}`" class="flex items-center gap-2 text-zinc-600 hover:text-zinc-900">
                <Icon name="lucide:phone" class="size-4 shrink-0 text-zinc-400" />
                {{ order.shipping.phone }}
              </a>
            </div>
            <div class="flex gap-2 text-zinc-600">
              <Icon name="lucide:map-pin" class="mt-0.5 size-4 shrink-0 text-zinc-400" />
              <address class="not-italic">
                {{ order.shipping.address }}<br>
                {{ order.shipping.postalCode }} {{ order.shipping.city }}
              </address>
            </div>
          </div>
          <div v-if="order.shipping.note" class="border-t border-zinc-100 px-4 py-3 text-sm">
            <p class="text-xs font-medium text-zinc-500">
              Napomena kupca
            </p>
            <p class="mt-1 whitespace-pre-line text-zinc-900">
              {{ order.shipping.note }}
            </p>
          </div>
        </section>
      </div>

      <div class="space-y-6">
        <!-- status -->
        <section class="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 class="text-sm font-semibold">
            Status
          </h2>

          <p class="mt-1 text-xs text-zinc-500">
            Klik menja status odmah. Kupac ga vidi na stranici „Prati porudžbinu".
          </p>

          <fieldset class="mt-3" :disabled="saving === 'status'">
            <legend class="sr-only">Status porudžbine</legend>
            <div class="space-y-1.5">
              <label
                v-for="s in STATUSES"
                :key="s"
                class="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-zinc-900"
                :class="order.status === s
                  ? (s === 'cancelled' ? 'border-red-300 bg-red-50' : 'border-zinc-900 bg-zinc-50')
                  : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'"
              >
                <input
                  type="radio"
                  name="order-status"
                  :value="s"
                  :checked="order.status === s"
                  class="size-4 shrink-0 accent-zinc-900"
                  @change="pickStatus($event, s)"
                >
                <span class="flex-1" :class="order.status === s ? 'font-medium text-zinc-900' : 'text-zinc-700'">
                  {{ orderStatuses[s].label }}
                </span>
                <Icon v-if="pendingStatus === s" name="lucide:loader-circle" class="size-4 animate-spin text-zinc-500" />
                <span v-else-if="order.dates[s]" class="flex items-center gap-1 text-xs whitespace-nowrap" :class="s === 'cancelled' ? 'text-red-600' : 'text-zinc-500'">
                  <Icon :name="s === 'cancelled' ? 'lucide:circle-x' : 'lucide:circle-check'" class="size-3.5" :class="s === 'cancelled' ? '' : 'text-emerald-600'" />
                  {{ formatAdminDateTime(order.dates[s]!) }}
                </span>
              </label>
            </div>
          </fieldset>
        </section>

        <!-- internal note -->
        <section class="rounded-lg border border-zinc-200 bg-white p-4">
          <label for="admin-note" class="text-sm font-semibold">Interna beleška</label>
          <p class="mt-0.5 text-xs text-zinc-500">
            Vidi je samo admin (npr. broj pošiljke, dogovor sa kupcem).
          </p>
          <textarea
            id="admin-note"
            v-model="note"
            rows="4"
            maxlength="1000"
            class="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:outline-none"
          />
          <button
            type="button"
            :disabled="saving !== null || !noteDirty"
            class="mt-2 inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-40"
            @click="update({ adminNote: note }, 'note')"
          >
            <Icon v-if="saving === 'note'" name="lucide:loader-circle" class="size-4 animate-spin" />
            Sačuvaj belešku
          </button>
        </section>
      </div>
    </div>
  </div>
</template>
