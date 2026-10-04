<script setup lang="ts">
import { loginSchema } from '#shared/schemas/auth'

definePageMeta({ middleware: 'guest' })

useSeoMeta({
  title: 'Prijava',
  description: 'Prijavite se na svoj Libra Herbal nalog.',
  robots: 'noindex',
})

const form = reactive({ email: '', password: '', remember: false })
const errors = ref<Record<string, string>>({})
const notice = ref('')
const pending = ref(false)

const route = useRoute()
const { login } = useAuth()

// the parsed data (trimmed, email lowercased) is what gets sent
function validate() {
  const result = loginSchema.safeParse(form)
  errors.value = result.success ? {} : fieldErrors(result.error)
  return result.data
}

async function onSubmit() {
  notice.value = ''
  if (pending.value) return
  const data = validate()
  if (!data) return
  pending.value = true
  try {
    await login(data)
    await navigateTo(safeRedirect(route.query.redirect))
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
</script>

<template>
  <AuthShell eyebrow="Moj nalog" title="Dobro došli" title-italic="nazad.">
    <form novalidate @submit.prevent="onSubmit">
      <h2 class="text-2xl leading-tight text-ink">
        Podaci za prijavu
      </h2>

      <div class="mt-6 space-y-3">
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

      <div class="mt-1 flex flex-wrap items-center justify-between gap-3">
        <FormCheckbox v-model="form.remember">
          Zapamti me
        </FormCheckbox>
        <NuxtLink to="/zaboravljena-lozinka" class="text-sm text-ink underline underline-offset-4 hover:text-forest">
          Zaboravili ste lozinku?
        </NuxtLink>
      </div>

      <p v-if="notice" class="mt-6 rounded-md border border-sun bg-sun-light/60 px-4 py-3 text-sm text-ink" role="alert">
        {{ notice }}
      </p>

      <BaseButton type="submit" size="lg" class="mt-8 w-full font-medium" :disabled="pending" :aria-busy="pending">
        <template v-if="pending">
          Prijavljujemo vas…
        </template>
        <template v-else>
          Prijavite se
          <Icon name="lucide:log-in" class="size-4" />
        </template>
      </BaseButton>

      <p class="mt-6 text-center text-sm text-ink">
        Nemate nalog?
        <NuxtLink :to="{ path: '/registracija', query: route.query }" class="font-semibold underline underline-offset-4 hover:text-forest">
          Registrujte se
        </NuxtLink>
      </p>
    </form>
  </AuthShell>
</template>
