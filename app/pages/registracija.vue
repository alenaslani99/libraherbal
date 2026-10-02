<script setup lang="ts">
useSeoMeta({
  title: 'Registracija',
  description: 'Napravite Libra Herbal nalog za brže poručivanje i praćenje porudžbina.',
  robots: 'noindex',
})

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  terms: false,
  newsletter: false,
})
const errors = reactive<Record<string, string>>({})
const notice = ref('')

function validate() {
  errors.firstName = form.firstName.trim() ? '' : 'Unesite ime.'
  errors.lastName = form.lastName.trim() ? '' : 'Unesite prezime.'
  errors.email = /^\S+@\S+\.\S+$/.test(form.email) ? '' : 'Unesite ispravnu email adresu.'
  errors.phone = /^[+\d][\d\s/-]{5,}$/.test(form.phone.trim()) ? '' : 'Unesite ispravan broj telefona.'
  errors.password = form.password.length >= 8 ? '' : 'Lozinka mora imati najmanje 8 karaktera.'
  errors.passwordConfirm = form.passwordConfirm === form.password ? '' : 'Lozinke se ne poklapaju.'
  errors.terms = form.terms ? '' : 'Morate prihvatiti uslove korišćenja.'
  return Object.values(errors).every(e => !e)
}

function onSubmit() {
  notice.value = ''
  if (!validate()) return
  // TODO: POST /api/auth/register once the backend (Worker + D1) is connected
  notice.value = 'Registracija još nije povezana sa serverom — biće aktivna uskoro.'
}
</script>

<template>
  <AuthShell eyebrow="Novi nalog" title="Napravite" title-italic="svoj nalog.">
    <form novalidate @submit.prevent="onSubmit">
      <h2 class="text-2xl leading-tight text-ink">
        Lični podaci
      </h2>
      <div class="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <FormField
          v-model="form.firstName"
          label="Ime"
          placeholder="Vaše ime"
          autocomplete="given-name"
          required
          :error="errors.firstName"
        />
        <FormField
          v-model="form.lastName"
          label="Prezime"
          placeholder="Vaše prezime"
          autocomplete="family-name"
          required
          :error="errors.lastName"
        />
        <FormField
          v-model="form.email"
          label="Email adresa"
          type="email"
          placeholder="ime@email.com"
          autocomplete="email"
          required
          :error="errors.email"
          class="sm:col-span-2"
        />
        <FormField
          v-model="form.phone"
          label="Telefon"
          type="tel"
          placeholder="+381 6X XXX XXXX"
          autocomplete="tel"
          required
          :error="errors.phone"
          class="sm:col-span-2"
        />
      </div>

      <h2 class="mt-12 text-2xl leading-tight text-ink">
        Lozinka
      </h2>
      <div class="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <FormField
          v-model="form.password"
          label="Lozinka"
          type="password"
          placeholder="Najmanje 8 karaktera"
          autocomplete="new-password"
          required
          :error="errors.password"
        />
        <FormField
          v-model="form.passwordConfirm"
          label="Potvrdite lozinku"
          type="password"
          placeholder="Ponovite lozinku"
          autocomplete="new-password"
          required
          :error="errors.passwordConfirm"
        />
      </div>

      <div class="mt-8 space-y-3">
        <FormCheckbox v-model="form.terms" :error="errors.terms">
          Prihvatam
          <NuxtLink to="/uslovi-koriscenja" class="underline underline-offset-4 hover:text-forest">uslove korišćenja</NuxtLink>
          i
          <NuxtLink to="/politika-privatnosti" class="underline underline-offset-4 hover:text-forest">politiku privatnosti</NuxtLink>.
        </FormCheckbox>
        <FormCheckbox v-model="form.newsletter">
          Želim da primam posebne savete i ponude putem email-a.
        </FormCheckbox>
      </div>

      <p v-if="notice" class="mt-6 rounded-md border border-sun bg-sun-light/60 px-4 py-3 text-sm text-ink" role="status">
        {{ notice }}
      </p>

      <BaseButton type="submit" size="lg" class="mt-8 w-full font-medium">
        Napravite nalog
        <Icon name="lucide:user-plus" class="size-4" />
      </BaseButton>

      <p class="mt-6 text-center text-sm text-ink">
        Već imate nalog?
        <NuxtLink to="/prijava" class="font-semibold underline underline-offset-4 hover:text-forest">
          Prijavite se
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>
