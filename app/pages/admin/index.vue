<script setup lang="ts">
import type { DashboardData, DashboardDays } from '#shared/types/dashboard'

definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Pregled' })

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

// period in the URL (?period=7), so a reload keeps it
const PERIODS: { days: DashboardDays, label: string }[] = [
  { days: 7, label: '7 dana' },
  { days: 30, label: '30 dana' },
  { days: 90, label: '90 dana' },
]
const days = computed<DashboardDays>(() => PERIODS.find(p => String(p.days) === route.query.period)?.days ?? 30)
function setDays(value: DashboardDays) {
  router.replace({ query: value === 30 ? {} : { period: String(value) } })
}

const { data, status, error } = await useFetch<DashboardData>('/api/admin/dashboard', {
  key: 'admin-dashboard',
  query: { days },
})


const todo = computed(() => {
  const t = data.value?.todo
  if (!t) return []
  return [
    { count: t.received, label: plural(t.received, 'nova porudžbina', 'nove porudžbine', 'novih porudžbina'), icon: 'lucide:shopping-bag', to: '/admin/porudzbine?status=received' },
    { count: t.preparing, label: 'u pripremi', icon: 'lucide:package-open', to: '/admin/porudzbine?status=preparing' },
    { count: t.newMessages, label: plural(t.newMessages, 'nova poruka', 'nove poruke', 'novih poruka'), icon: 'lucide:mail', to: '/admin/poruke?status=new' },
    { count: t.productProblems, label: plural(t.productProblems, 'proizvod za proveru', 'proizvoda za proveru', 'proizvoda za proveru'), icon: 'lucide:triangle-alert', to: '/admin/proizvodi?filter=problems' },
    { count: t.ingredientsMissing, label: plural(t.ingredientsMissing, 'sastojak bez opisa', 'sastojka bez opisa', 'sastojaka bez opisa'), icon: 'lucide:leaf', to: '/admin/kategorije?tab=sastojci&filter=missing' },
  ]
})

const greeting = computed(() => {
  const hour = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Belgrade' }))
  const word = hour < 12 ? 'Dobro jutro' : hour < 18 ? 'Dobar dan' : 'Dobro veče'
  return user.value?.firstName ? `${word}, ${user.value.firstName}` : word
})
const todayLabel = new Date().toLocaleDateString('sr-Latn-RS', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Belgrade' })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="font-sans text-2xl font-semibold tracking-tight text-zinc-900">
          {{ greeting }}
        </h1>
        <p class="mt-1 text-sm text-zinc-500 first-letter:uppercase">
          {{ todayLabel }}
        </p>
      </div>
      <div class="inline-flex rounded-md border border-zinc-200 bg-white p-0.5 text-sm" role="radiogroup" aria-label="Period">
        <button
          v-for="p in PERIODS"
          :key="p.days"
          type="button"
          role="radio"
          :aria-checked="days === p.days"
          class="rounded px-3 py-1.5 font-medium"
          :class="days === p.days ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'"
          @click="setDays(p.days)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ apiError(error).message || 'Pregled nije učitan.' }}
    </p>

    <div v-else-if="!data" class="mt-16 flex items-center justify-center gap-2 text-sm text-zinc-500">
      <Icon name="lucide:loader-circle" class="size-4 animate-spin" />
      Učitavanje…
    </div>

    <template v-else>
      <!-- what needs attention now -->
      <section class="mt-6" aria-labelledby="todo-title">
        <h2 id="todo-title" class="text-sm font-semibold text-zinc-900">
          Za obradu
        </h2>
        <ul class="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <li v-for="item in todo" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="group flex h-full items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-colors"
              :class="item.count ? 'border-zinc-200 hover:border-zinc-400' : 'border-zinc-100'"
            >
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-md"
                :class="item.count ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-400'"
              >
                <Icon :name="item.count ? item.icon : 'lucide:check'" class="size-4" />
              </span>
              <span class="min-w-0 leading-tight">
                <span class="block text-lg font-semibold" :class="item.count ? 'text-zinc-900' : 'text-zinc-400'">{{ item.count }}</span>
                <span class="block text-xs" :class="item.count ? 'text-zinc-600' : 'text-zinc-400'">{{ item.label }}</span>
              </span>
              <Icon v-if="item.count" name="lucide:chevron-right" class="ml-auto size-4 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-600" />
            </NuxtLink>
          </li>
        </ul>
      </section>

      <!-- period numbers -->
      <section class="mt-8" aria-labelledby="kpi-title" :class="{ 'opacity-60 transition-opacity': status === 'pending' }">
        <h2 id="kpi-title" class="text-sm font-semibold text-zinc-900">
          Poslednjih {{ days }} dana
        </h2>
        <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Prihod" :value="data.current.revenue" :previous="data.previous.revenue" money />
          <StatTile label="Porudžbine" :value="data.current.orders" :previous="data.previous.orders" />
          <StatTile label="Prosečna porudžbina" :value="data.current.avgOrder" :previous="data.previous.avgOrder" money />
          <StatTile label="Otkazane" :value="data.current.cancelled" :previous="data.previous.cancelled" up-is-bad />
        </div>
        <p class="mt-2 text-xs text-zinc-400">
          Prihod je zbir porudžbina sa dostavom, bez otkazanih, po danu kada su primljene.
        </p>

        <div class="mt-6 grid gap-6 xl:grid-cols-3">
          <div class="rounded-lg border border-zinc-200 bg-white p-4 xl:col-span-2">
            <h3 class="text-sm font-semibold text-zinc-900">
              Prihod {{ days === 90 ? 'po nedeljama' : 'po danima' }}
            </h3>
            <p class="mt-0.5 text-xs text-zinc-500">
              RSD, bez otkazanih porudžbina
            </p>
            <RevenueChart :buckets="data.buckets" :weekly="days === 90" class="mt-6" />
          </div>

          <div class="rounded-lg border border-zinc-200 bg-white p-4">
            <h3 class="text-sm font-semibold text-zinc-900">
              Najprodavaniji proizvodi
            </h3>
            <p class="mt-0.5 text-xs text-zinc-500">
              Prodati komadi, poslednjih {{ days }} dana
            </p>
            <ol v-if="data.topProducts.length" class="mt-4 space-y-3">
              <li v-for="(p, i) in data.topProducts" :key="`${p.productId}-${p.name}`" class="text-sm">
                <div class="flex items-baseline gap-2">
                  <span class="w-4 text-xs text-zinc-400 tabular-nums">{{ i + 1 }}.</span>
                  <NuxtLink v-if="p.productId" :to="`/admin/proizvodi/${p.productId}`" class="min-w-0 flex-1 truncate text-zinc-900 hover:underline">
                    {{ p.name }}
                  </NuxtLink>
                  <span v-else class="min-w-0 flex-1 truncate text-zinc-500">{{ p.name }}</span>
                  <span class="font-medium text-zinc-900 tabular-nums">{{ p.units }} kom.</span>
                </div>
                <!-- share of the best seller, so the list reads at a glance -->
                <div class="mt-1.5 ml-6 h-1.5 rounded-full bg-zinc-100">
                  <div class="h-full rounded-full bg-zinc-800" :style="{ width: `${(p.units / data.topProducts[0]!.units) * 100}%` }" />
                </div>
                <p class="mt-1 ml-6 text-xs text-zinc-500">
                  {{ p.revenue }},00 RSD
                </p>
              </li>
            </ol>
            <p v-else class="mt-10 text-center text-sm text-zinc-400">
              Još nema prodaje u ovom periodu.
            </p>
          </div>
        </div>
      </section>

      <!-- newest orders, whatever the period -->
      <section class="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white" aria-labelledby="recent-title">
        <div class="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 id="recent-title" class="text-sm font-semibold text-zinc-900">
            Najnovije porudžbine
          </h2>
          <NuxtLink to="/admin/porudzbine" class="text-xs font-medium text-zinc-600 hover:text-zinc-900">
            Sve porudžbine →
          </NuxtLink>
        </div>
        <p v-if="!data.recentOrders.length" class="py-10 text-center text-sm text-zinc-400">
          Još nema porudžbina.
        </p>
        <table v-else class="w-full text-left text-sm">
          <tbody class="divide-y divide-zinc-100">
            <tr v-for="order in data.recentOrders" :key="order.id" class="relative hover:bg-zinc-50">
              <td class="px-4 py-3">
                <NuxtLink :to="`/admin/porudzbine/${order.id}`" class="font-medium whitespace-nowrap text-zinc-900 after:absolute after:inset-0 hover:underline">
                  {{ order.orderNumber }}
                </NuxtLink>
                <!-- phones: customer and status under the number, so the total keeps its room -->
                <span class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 sm:hidden">
                  {{ order.customer }}
                  <span class="rounded-full px-2 py-0.5 font-medium whitespace-nowrap" :class="adminOrderStatusClass[order.status]">
                    {{ orderStatuses[order.status].label }}
                  </span>
                </span>
              </td>
              <td class="hidden px-4 py-3 text-zinc-700 sm:table-cell">
                {{ order.customer }}
                <span class="block text-xs text-zinc-500">{{ order.city }} · {{ order.itemCount }} kom.</span>
              </td>
              <td class="hidden px-4 py-3 sm:table-cell">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap" :class="adminOrderStatusClass[order.status]">
                  {{ orderStatuses[order.status].label }}
                </span>
              </td>
              <td class="hidden px-4 py-3 whitespace-nowrap text-zinc-500 md:table-cell">
                {{ formatAdminDateTime(order.placedAt) }}
              </td>
              <td class="px-4 py-3 text-right font-medium whitespace-nowrap text-zinc-900">
                {{ order.total }},00 <span class="text-xs font-normal text-zinc-500">RSD</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>
