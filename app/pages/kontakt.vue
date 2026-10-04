<script setup lang="ts">
import { contactSchema } from '#shared/schemas/contact'
import { contact, socials } from '~/data/footer'

usePageSeo({
  title: 'Kontakt',
  description: 'Kontaktirajte Libra Herbal: pozovite nas, pišite nam na email ili pošaljite poruku. Nalazimo se u Velikoj Plani, Miloša Velikog BB.',
})

const absolute = useAbsoluteUrl()
useJsonLd('contact', {
  '@type': 'ContactPage',
  'url': absolute('/kontakt'),
  'name': 'Kontakt | Libra Herbal',
})

const { user } = useAuth()

// signed-in customers don't retype what their account already has
const form = reactive({
  name: user.value ? `${user.value.firstName} ${user.value.lastName}`.trim() : '',
  email: user.value?.email ?? '',
  phone: user.value?.phone ?? '',
  message: '',
  website: '',
})
const errors = ref<Record<string, string>>({})
const notice = ref('')
const sent = ref(false)
const pending = ref(false)

// the parsed data (trimmed, email lowercased) is what gets sent
function validate() {
  const result = contactSchema.safeParse(form)
  errors.value = result.success ? {} : fieldErrors(result.error)
  return result.data
}

async function onSubmit() {
  notice.value = ''
  sent.value = false
  if (pending.value) return
  const data = validate()
  if (!data) return
  pending.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: data })
    form.message = ''
    sent.value = true
  }
  catch (error) {
    const { fields, message } = apiError(error)
    errors.value = fields
    notice.value = message
  }
  finally {
    pending.value = false
  }
}

const addressLine = `${contact.address.street}, ${contact.address.postalCode} ${contact.address.city}`
</script>

<template>
  <div>
    <section class="bg-pale-beige">
      <div class="mx-auto max-w-[1440px] px-4 pt-12 pb-16 sm:px-6 lg:px-16 lg:pt-[72px] lg:pb-24 xl:px-32">
        <PageHeading eyebrow="Kontakt" title="Tu smo" title-italic="za vas." />

        <div class="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,643px)_minmax(300px,448px)] lg:justify-between lg:gap-16">
          <form novalidate @submit.prevent="onSubmit">
            <h2 class="text-2xl leading-tight text-ink">
              Pošaljite nam poruku
            </h2>
            <p class="mt-2 text-sm text-brown-200">
              Pitanje o proizvodu, porudžbini ili saradnji — odgovaramo u roku od 1–2 radna dana.
            </p>

            <div class="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <FormField
                v-model="form.name"
                label="Ime i prezime"
                placeholder="Vaše ime i prezime"
                autocomplete="name"
                required
                :error="errors.name"
                class="sm:col-span-2"
              />
              <FormField
                v-model="form.email"
                label="Email adresa"
                type="email"
                placeholder="ime@email.com"
                autocomplete="email"
                required
                :error="errors.email"
              />
              <FormField
                v-model="form.phone"
                label="Telefon (opciono)"
                type="tel"
                placeholder="+381 6X XXX XXXX"
                autocomplete="tel"
                :error="errors.phone"
              />
              <FormTextarea
                v-model="form.message"
                label="Poruka"
                placeholder="Kako možemo da pomognemo?"
                :maxlength="1000"
                :rows="6"
                :error="errors.message"
                class="sm:col-span-2"
              />
            </div>

            <!-- honeypot: off-screen and skipped by keyboard and screen readers; only bots fill it -->
            <div class="absolute -left-[9999px] size-px overflow-hidden" aria-hidden="true">
              <label>
                Website
                <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
              </label>
            </div>

            <p v-if="notice" class="mt-6 rounded-md border border-sun bg-sun-light/60 px-4 py-3 text-sm text-ink" role="alert">
              {{ notice }}
            </p>
            <p v-if="sent" class="mt-6 flex items-center gap-2 rounded-md border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-forest" role="status">
              <Icon name="lucide:check" class="size-4 shrink-0" />
              Poruka je poslata. Javićemo vam se uskoro.
            </p>

            <BaseButton type="submit" size="lg" class="mt-8 w-full font-medium" :disabled="pending" :aria-busy="pending">
              <template v-if="pending">
                Šaljemo poruku…
              </template>
              <template v-else>
                Pošalji poruku
                <Icon name="lucide:send" class="size-4" />
              </template>
            </BaseButton>
          </form>

          <!-- Dark green card, same style as AuthBenefits -->
          <aside class="rounded-xl bg-forest p-6 text-white sm:p-7 lg:sticky lg:top-24 lg:self-start">
            <p class="text-xs font-semibold uppercase tracking-wide">
              Kontakt podaci
            </p>
            <div class="mt-4 h-1 rounded-full bg-sun" />

            <ul class="mt-6 space-y-5">
              <li class="flex items-start gap-3">
                <Icon name="lucide:map-pin" class="mt-0.5 size-5 shrink-0 text-sun" />
                <div class="leading-tight">
                  <p class="text-sm font-semibold">
                    Adresa
                  </p>
                  <p class="mt-0.5 text-sm font-light text-white/75">
                    {{ contact.address.street }}<br>
                    {{ contact.address.postalCode }} {{ contact.address.city }}
                  </p>
                </div>
              </li>
              <li>
                <a :href="`tel:${contact.phone.replace(/\s/g, '')}`" class="group flex items-start gap-3">
                  <Icon name="lucide:phone" class="mt-0.5 size-5 shrink-0 text-sun" />
                  <span class="leading-tight">
                    <span class="block text-sm font-semibold">Telefon</span>
                    <span class="mt-0.5 block text-sm font-light text-white/75 transition-colors group-hover:text-sun">{{ contact.phone }}</span>
                  </span>
                </a>
              </li>
              <li>
                <a :href="`mailto:${contact.email}`" class="group flex items-start gap-3">
                  <Icon name="lucide:mail" class="mt-0.5 size-5 shrink-0 text-sun" />
                  <span class="leading-tight">
                    <span class="block text-sm font-semibold">Email</span>
                    <span class="mt-0.5 block text-sm font-light text-white/75 transition-colors group-hover:text-sun">{{ contact.email }}</span>
                  </span>
                </a>
              </li>
            </ul>

            <div class="mt-6 border-t border-white/30 pt-5">
              <p class="text-sm font-semibold">
                Pratite nas
              </p>
              <ul class="mt-3 flex items-center gap-5">
                <li v-for="social in socials" :key="social.label">
                  <a
                    :href="social.href"
                    :aria-label="social.label"
                    target="_blank"
                    rel="noopener"
                    class="block transition-colors duration-200 hover:text-sun"
                  >
                    <Icon :name="social.icon" class="size-6" />
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <div class="mt-16 lg:mt-24">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <h2 class="text-2xl leading-tight text-ink">
              Gde se nalazimo
            </h2>
            <a
              :href="`https://www.google.com/maps/search/?api=1&query=${contact.mapsQuery}`"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 text-sm text-ink underline underline-offset-4 hover:text-forest"
            >
              <Icon name="lucide:external-link" class="size-4" />
              Otvori u Google mapama
            </a>
          </div>
          <div class="mt-6 overflow-hidden rounded-xl border border-line">
            <iframe
              :src="`https://maps.google.com/maps?q=${contact.mapsQuery}&z=15&output=embed`"
              :title="`Mapa: ${addressLine}`"
              class="block h-[320px] w-full sm:h-[420px]"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
    <NewsletterSection />
  </div>
</template>
