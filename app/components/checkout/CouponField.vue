<script setup lang="ts">
const props = defineProps<{
  // the code the server accepted; null = none applied
  coupon: { code: string, percent: number } | null
  // why the applied code was rejected
  error: string | null
}>()

// the applied code (sent with the quote and the order); '' = none
const model = defineModel<string>({ required: true })
const draft = ref(model.value)

// the message belongs to the code that was sent, so it disappears as soon as the customer edits it
const shownError = computed(() => (props.error && draft.value.trim().toUpperCase() === model.value ? props.error : ''))

function apply() {
  model.value = draft.value.trim().toUpperCase()
}

function remove() {
  model.value = ''
  draft.value = ''
}
</script>

<!-- Discount code inside the "Vaša korpa" card on /placanje (dark green background) -->
<template>
  <div class="mt-5 border-b border-white/20 pb-5">
    <div v-if="coupon" class="flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-2.5 text-xs">
      <span class="flex min-w-0 items-center gap-2">
        <Icon name="lucide:ticket-percent" class="size-4 shrink-0 text-sun" />
        <span class="truncate font-semibold tracking-wide">{{ coupon.code }}</span>
        <span class="shrink-0 text-white/70">−{{ coupon.percent }}%</span>
      </span>
      <button type="button" class="shrink-0 text-[11px] text-white/80 underline underline-offset-4 transition-colors hover:text-sun" @click="remove">
        Ukloni
      </button>
    </div>

    <form v-else novalidate @submit.prevent="apply">
      <label for="coupon-code" class="text-[11px] leading-none text-white/80">Imate kod za popust?</label>
      <div class="mt-2 flex gap-2">
        <input
          id="coupon-code"
          v-model="draft"
          type="text"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          maxlength="40"
          placeholder="npr. 7K3FQ9MA"
          class="h-9 min-w-0 flex-1 rounded-md border bg-white/10 px-3 text-xs uppercase tracking-wide text-white placeholder:normal-case placeholder:tracking-normal placeholder:text-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-sun"
          :class="shownError ? 'border-sun' : 'border-white/20'"
          :aria-invalid="!!shownError"
          aria-describedby="coupon-code-error"
        >
        <button
          type="submit"
          class="h-9 shrink-0 rounded-md bg-sun px-4 text-xs font-medium text-ink transition-colors hover:bg-sun-hover disabled:opacity-50"
          :disabled="!draft.trim()"
        >
          Primeni
        </button>
      </div>
      <!-- space kept for the message, so the card doesn't jump when it appears -->
      <p id="coupon-code-error" class="mt-2 min-h-4 text-[11px] leading-4 text-sun" role="alert">
        {{ shownError }}
      </p>
    </form>
  </div>
</template>
