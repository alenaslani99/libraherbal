<script setup lang="ts">
useSeoMeta({
  title: 'Prijava',
  description: 'Prijavite se na svoj Libra Herbal nalog.',
  robots: 'noindex',
})

const form = reactive({ email: '', password: '', remember: false })
const errors = reactive<Record<string, string>>({})
const notice = ref('')

function validate() {
  errors.email = /^\S+@\S+\.\S+$/.test(form.email) ? '' : 'Unesite ispravnu email adresu.'
  errors.password = form.password ? '' : 'Unesite lozinku.'
  return !errors.email && !errors.password
}

function onSubmit() {
  notice.value = ''
  if (!validate()) return
  // TODO: POST /api/auth/login once the backend (Worker + D1) is connected
  notice.value = 'Prijava još nije povezana sa serverom — biće aktivna uskoro.'
}
</script>

<template>
  <AuthShell eyebrow="Moj nalog" title="Dobro došli" title-italic="nazad.">
    <form novalidate @submit.prevent="onSubmit">
      <h2 class="text-2xl leading-tight text-ink">
        Podaci za prijavu
      </h2>

      <div class="mt-6 space-y-5">
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
          v-model="form.password"
          label="Lozinka"
          type="password"
          placeholder="Vaša lozinka"
          autocomplete="current-password"
          required
          :error="errors.password"
        />
      </div>

      <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
        <FormCheckbox v-model="form.remember">
          Zapamti me
        </FormCheckbox>
        <NuxtLink to="/zaboravljena-lozinka" class="text-sm text-ink underline underline-offset-4 hover:text-forest">
          Zaboravili ste lozinku?
        </NuxtLink>
      </div>

      <p v-if="notice" class="mt-6 rounded-md border border-sun bg-sun-light/60 px-4 py-3 text-sm text-ink" role="status">
        {{ notice }}
      </p>

      <BaseButton type="submit" size="lg" class="mt-8 w-full font-medium">
        Prijavite se
        <Icon name="lucide:log-in" class="size-4" />
      </BaseButton>

      <p class="mt-6 text-center text-sm text-ink">
        Nemate nalog?
        <NuxtLink to="/registracija" class="font-semibold underline underline-offset-4 hover:text-forest">
          Registrujte se
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>
