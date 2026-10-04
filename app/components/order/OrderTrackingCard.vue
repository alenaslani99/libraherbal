<script setup lang="ts">
import type { OrderStatus, OrderTracking } from '#shared/types/order'

const props = defineProps<{ order: OrderTracking }>()

type StepState = 'done' | 'current' | 'pending' | 'cancelled'

const FLOW = ['received', 'preparing', 'in_transit', 'delivered'] as const

const stepText: Record<OrderStatus, { title: string, text: string }> = {
  received: { title: 'Porudžbina primljena', text: 'Vaša porudžbina je uspešno kreirana i čeka obradu.' },
  preparing: { title: 'U pripremi', text: 'Pažljivo pakujemo vaše proizvode za slanje.' },
  in_transit: { title: 'U transportu', text: 'Vaša porudžbina je predata kuriru i kreće ka vama.' },
  delivered: { title: 'Isporučeno', text: 'Vaša porudžbina je uspešno isporučena. Hvala na poverenju!' },
  cancelled: { title: 'Otkazana', text: 'Porudžbina je otkazana. Za sva pitanja nam se slobodno javite.' },
}

// The current status decides the timeline, not which dates exist: the shop may skip a step
// (e.g. U pripremi → Isporučeno), and a skipped step still shows as done, just without a date.
const steps = computed(() => {
  const { status, dates } = props.order

  if (status === 'cancelled') {
    // only what actually happened before the cancellation, then the cancellation itself
    return [
      ...FLOW.filter(key => dates[key]).map(key => ({ key, state: 'done' as StepState, date: dates[key] })),
      { key: 'cancelled' as const, state: 'cancelled' as StepState, date: dates.cancelled },
    ]
  }

  const current = FLOW.indexOf(status)
  return FLOW.map((key, i) => {
    let state: StepState = 'pending'
    if (i < current || (i === current && status === 'delivered')) state = 'done'
    else if (i === current) state = 'current'
    return { key, state, date: state === 'pending' ? null : dates[key] }
  })
})

const circle: Record<StepState, string> = {
  done: 'bg-forest text-sun',
  current: 'bg-sun text-ink',
  pending: 'border-2 border-line bg-paper text-muted',
  cancelled: 'bg-red-700 text-white',
}
</script>

<template>
  <div class="rounded-2xl border border-line bg-paper p-5 shadow-sm sm:p-8">
    <div class="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-5">
      <div>
        <p class="text-sm text-muted">
          Porudžbina
        </p>
        <h2 class="mt-1 text-2xl leading-tight text-forest sm:text-[28px]">
          {{ order.orderNumber }}
        </h2>
      </div>
      <span class="rounded-full px-4 py-1.5 text-sm font-semibold" :class="orderStatuses[order.status].class">
        {{ orderStatuses[order.status].label }}
      </span>
    </div>

    <div class="mt-5 rounded-xl bg-pale-beige/60 p-5 text-sm">
      <p class="font-semibold text-ink">
        Stavke porudžbine
      </p>
      <ul class="mt-3 space-y-2">
        <li v-for="(item, i) in order.items" :key="i" class="flex justify-between gap-4 text-ink">
          <span>{{ item.name }} <span class="text-brown-200">× {{ item.quantity }}</span></span>
          <span class="shrink-0">{{ item.lineTotal }},00 RSD</span>
        </li>
      </ul>
      <dl class="mt-4 space-y-1 border-t border-line pt-4 text-muted">
        <div class="flex justify-between gap-4">
          <dt>Proizvodi</dt>
          <dd>{{ order.subtotal }},00 RSD</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt>Dostava</dt>
          <dd>{{ order.shipping ? `${order.shipping},00 RSD` : 'Besplatna' }}</dd>
        </div>
        <div class="flex justify-between gap-4 font-semibold text-ink">
          <dt>Ukupno</dt>
          <dd>{{ order.total }},00 RSD</dd>
        </div>
      </dl>
    </div>

    <ol class="mt-8">
      <li v-for="(step, i) in steps" :key="step.key" class="relative flex gap-4 pb-7 last:pb-0">
        <!-- connector to the next step: green once this step is done -->
        <span
          v-if="i < steps.length - 1"
          class="absolute top-11 bottom-1 left-[19px] w-0.5 rounded-full"
          :class="step.state === 'done' ? 'bg-forest' : 'bg-line'"
          aria-hidden="true"
        />
        <span class="grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold" :class="circle[step.state]">
          <Icon v-if="step.state === 'done'" name="lucide:check" class="size-5" />
          <Icon v-else-if="step.state === 'current'" name="lucide:loader-circle" class="size-5 animate-spin [animation-duration:2.5s]" />
          <Icon v-else-if="step.state === 'cancelled'" name="lucide:x" class="size-5" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        <div class="pt-1.5">
          <p class="flex flex-wrap items-center gap-2 font-semibold leading-6" :class="step.state === 'pending' ? 'text-muted' : 'text-ink'">
            {{ stepText[step.key].title }}
            <span v-if="step.state === 'current'" class="rounded-full bg-sun-light px-2 py-0.5 text-xs font-semibold text-ink">U toku</span>
          </p>
          <p class="mt-0.5 text-sm leading-6 text-muted">
            {{ stepText[step.key].text }}
          </p>
          <p v-if="step.date" class="mt-0.5 text-xs text-brown-200">
            {{ formatOrderDate(step.date) }}
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
