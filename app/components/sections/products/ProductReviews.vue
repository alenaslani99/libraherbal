<script setup lang="ts">
import type { ProductReviews } from '#shared/types/engagement'
import { reviewSchema } from '#shared/schemas/engagement'

const props = defineProps<{ slug: string, productName: string }>()

const { loggedIn } = useAuth()
const route = useRoute()

const { data, refresh } = await useFetch<ProductReviews>(() => `/api/products/${encodeURIComponent(props.slug)}/reviews`, {
  key: `reviews-${props.slug}`,
})
// signing in or out changes "mine"
watch(loggedIn, () => refresh())

// newest first; the rest behind "Prikaži još"
const shown = ref(6)
const visible = computed(() => data.value?.reviews.slice(0, shown.value) ?? [])

// ----- form ------------------------------------------------------------------------------
const editing = ref(false)
const form = reactive({ rating: 0, comment: '' })
const errors = ref<Record<string, string>>({})
const notice = ref('')
const pending = ref(false)
const thanks = ref(false)

function startEdit() {
  form.rating = data.value?.mine?.rating ?? 0
  form.comment = data.value?.mine?.comment ?? ''
  errors.value = {}
  notice.value = ''
  thanks.value = false
  editing.value = true
}
const showForm = computed(() => loggedIn.value && (editing.value || !data.value?.mine))

async function submit() {
  notice.value = ''
  const result = reviewSchema.safeParse(form)
  errors.value = result.success ? {} : fieldErrors(result.error)
  if (!result.success) return
  pending.value = true
  try {
    await $fetch(`/api/products/${encodeURIComponent(props.slug)}/reviews`, { method: 'POST', body: result.data })
    await refresh()
    editing.value = false
    thanks.value = true
  }
  catch (e) {
    const { fields, message } = apiError(e)
    errors.value = fields
    notice.value = message
  }
  finally {
    pending.value = false
  }
}

async function remove() {
  if (!window.confirm('Obrisati vašu recenziju?')) return
  pending.value = true
  try {
    await $fetch(`/api/products/${encodeURIComponent(props.slug)}/reviews`, { method: 'DELETE' })
    await refresh()
    thanks.value = false
    form.rating = 0
    form.comment = ''
  }
  catch (e) {
    notice.value = apiError(e).message
  }
  finally {
    pending.value = false
  }
}

// star picker: hover previews, click sets
const hover = ref(0)
const STAR_LABELS = ['', 'Loše', 'Može bolje', 'Dobro', 'Vrlo dobro', 'Odlično']

const loginLink = computed(() => `/prijava?redirect=${encodeURIComponent(`${route.path}#recenzije`)}`)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'long', year: 'numeric' })
}
const countLabel = (n: number) => `${n} ${plural(n, 'recenzija', 'recenzije', 'recenzija')}`
</script>

<template>
  <section id="recenzije" class="scroll-mt-24 bg-paper" aria-labelledby="reviews-title">
    <div class="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16 lg:px-16 lg:py-[72px] xl:px-32">
      <!-- summary + form -->
      <div>
        <p class="text-xs uppercase leading-none tracking-[0.06em] text-ink">
          Iskustva kupaca
        </p>
        <h2 id="reviews-title" class="mt-3 text-[40px] leading-none tracking-[-0.02em] text-forest">
          Recenzije
        </h2>

        <div v-if="data?.count" class="mt-8 flex items-center gap-4">
          <p class="text-5xl font-semibold leading-none text-ink">
            {{ String(data.average).replace('.', ',') }}
          </p>
          <div>
            <RatingStars :rating="data.average" />
            <p class="mt-1.5 text-xs text-muted">
              {{ countLabel(data.count) }}
            </p>
          </div>
        </div>
        <ul v-if="data?.count" class="mt-5 space-y-1.5" aria-label="Raspodela ocena">
          <li v-for="(n, i) in data.distribution" :key="i" class="flex items-center gap-3 text-xs text-ink">
            <span class="w-8 tabular-nums">{{ 5 - i }} ★</span>
            <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <span class="block h-full rounded-full bg-sun" :style="{ width: `${(n / data.count) * 100}%` }" />
            </span>
            <span class="w-6 text-right text-muted tabular-nums">{{ n }}</span>
          </li>
        </ul>
        <p v-else class="mt-6 text-sm text-muted">
          Još nema recenzija za ovaj proizvod. Budite prvi koji će podeliti iskustvo.
        </p>

        <div class="mt-10 border-t border-line pt-8">
          <!-- guest -->
          <div v-if="!loggedIn">
            <p class="text-sm text-ink">
              Probali ste {{ productName }}? Prijavite se da biste ostavili recenziju.
            </p>
            <BaseButton :to="loginLink" variant="forest" class="mt-4">
              Prijavite se
            </BaseButton>
          </div>

          <!-- own review, not being edited -->
          <div v-else-if="data?.mine && !editing">
            <p v-if="thanks" class="mb-4 flex items-start gap-2 text-sm text-forest" role="status">
              <Icon name="lucide:circle-check" class="mt-0.5 size-4 shrink-0" />
              Hvala! Recenzija će se pojaviti na sajtu nakon provere.
            </p>
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-semibold text-ink">
                Vaša recenzija
              </p>
              <span
                class="rounded-full px-2.5 py-1 text-[11px] font-medium leading-none"
                :class="data.mine.approved ? 'bg-forest text-white' : 'bg-sun-light text-ink'"
              >
                {{ data.mine.approved ? 'Objavljena' : 'Čeka odobrenje' }}
              </span>
            </div>
            <RatingStars :rating="data.mine.rating" class="mt-3" />
            <p v-if="data.mine.comment" class="mt-2 text-sm whitespace-pre-line text-ink">
              {{ data.mine.comment }}
            </p>
            <div class="mt-4 flex gap-4 text-sm">
              <button type="button" class="font-medium text-forest underline underline-offset-2 hover:text-ink" @click="startEdit">
                Izmeni
              </button>
              <button type="button" :disabled="pending" class="text-muted underline underline-offset-2 hover:text-red-700 disabled:opacity-50" @click="remove">
                Obriši
              </button>
            </div>
          </div>

          <!-- write / edit -->
          <form v-else-if="showForm" novalidate @submit.prevent="submit">
            <p class="text-sm font-semibold text-ink">
              {{ data?.mine ? 'Izmena recenzije' : 'Napišite recenziju' }}
            </p>

            <fieldset class="mt-4">
              <legend class="text-xs text-muted">
                Vaša ocena
              </legend>
              <div class="mt-2 flex items-center gap-3">
                <div class="flex" role="radiogroup" aria-label="Ocena" @mouseleave="hover = 0">
                  <label
                    v-for="n in 5"
                    :key="n"
                    class="cursor-pointer p-0.5 has-[:focus-visible]:rounded has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sun"
                    @mouseenter="hover = n"
                  >
                    <input v-model="form.rating" type="radio" name="review-rating" :value="n" class="sr-only">
                    <span class="sr-only">{{ n }} od 5 – {{ STAR_LABELS[n] }}</span>
                    <Icon
                      name="lucide:star"
                      class="size-7 transition-colors *:fill-current"
                      :class="n <= (hover || form.rating) ? 'text-sun' : 'text-line'"
                      aria-hidden="true"
                    />
                  </label>
                </div>
                <span class="text-sm text-muted" aria-live="polite">{{ STAR_LABELS[hover || form.rating] }}</span>
              </div>
              <p v-if="errors.rating" class="mt-1 text-xs text-red-700">
                {{ errors.rating }}
              </p>
            </fieldset>

            <label for="review-comment" class="mt-5 block text-xs text-muted">Komentar (nije obavezan)</label>
            <textarea
              id="review-comment"
              v-model="form.comment"
              rows="4"
              maxlength="1000"
              placeholder="Kako vam se dopao proizvod? Ukus, efekat, pakovanje…"
              class="mt-2 w-full resize-y rounded-2xl border bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-forest focus:ring-2 focus:ring-sun focus:outline-none"
              :class="errors.comment ? 'border-red-700' : 'border-line'"
            />
            <p class="mt-1 flex justify-between text-xs" :class="errors.comment ? 'text-red-700' : 'text-muted'">
              <span>{{ errors.comment }}</span>
              <span>{{ form.comment.length }}/1000</span>
            </p>

            <p v-if="notice" class="mt-3 text-sm text-red-700" role="alert">
              {{ notice }}
            </p>

            <div class="mt-4 flex items-center gap-4">
              <BaseButton type="submit" variant="forest" :disabled="pending">
                <Icon v-if="pending" name="lucide:loader-circle" class="size-4 animate-spin" />
                {{ data?.mine ? 'Sačuvaj izmene' : 'Pošalji recenziju' }}
              </BaseButton>
              <button v-if="editing && data?.mine" type="button" class="text-sm text-muted underline underline-offset-2 hover:text-ink" @click="editing = false">
                Otkaži
              </button>
            </div>
            <p class="mt-3 text-xs text-muted">
              Recenzije pregledamo pre objavljivanja. Prikazuje se vaše ime i prvo slovo prezimena.
            </p>
          </form>
        </div>
      </div>

      <!-- approved reviews -->
      <div>
        <ul v-if="visible.length" class="grid gap-4 sm:grid-cols-2">
          <li v-for="review in visible" :key="review.id">
            <article class="flex h-full flex-col gap-4 border border-line bg-white/60 p-5 sm:p-6">
              <div class="flex items-center justify-between gap-3">
                <RatingStars :rating="review.rating" />
                <time :datetime="review.createdAt" class="text-xs text-muted">{{ formatDate(review.createdAt) }}</time>
              </div>
              <p v-if="review.comment" class="text-sm leading-[18px] whitespace-pre-line text-ink">
                {{ review.comment }}
              </p>
              <p class="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1">
                <span class="font-heading text-sm font-medium italic text-ink">{{ review.author }}</span>
                <span v-if="review.verified" class="inline-flex items-center gap-1 text-[11px] text-forest">
                  <Icon name="lucide:badge-check" class="size-3.5" />
                  Verifikovana kupovina
                </span>
              </p>
            </article>
          </li>
        </ul>
        <div v-else class="flex h-full min-h-40 items-center justify-center border border-dashed border-line p-8 text-center text-sm text-muted">
          Recenzije kupaca će se prikazati ovde.
        </div>

        <div v-if="data && data.reviews.length > shown" class="mt-6 text-center">
          <button type="button" class="text-sm font-medium text-forest underline underline-offset-2 hover:text-ink" @click="shown += 6">
            Prikaži još recenzija
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
