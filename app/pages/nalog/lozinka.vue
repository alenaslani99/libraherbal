<script setup lang="ts">
import { changePasswordSchema } from '#shared/schemas/auth'

// "Promena lozinke" tab — the server signs out every other device after the change
const form = reactive({ currentPassword: '', newPassword: '', newPasswordConfirm: '' })
const errors = ref<Record<string, string>>({})
const notice = ref('')
const success = ref(false)
const pending = ref(false)

function validate() {
  const result = changePasswordSchema.safeParse(form)
  errors.value = result.success ? {} : fieldErrors(result.error)
  return result.data
}

async function onSubmit() {
  notice.value = ''
  success.value = false
  if (pending.value) return
  const data = validate()
  if (!data) return
  pending.value = true
  try {
    await $fetch('/api/auth/password', { method: 'POST', body: data })
    Object.assign(form, { currentPassword: '', newPassword: '', newPasswordConfirm: '' })
    success.value = true
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
  <form class="max-w-[643px]" novalidate @submit.prevent="onSubmit">
    <h2 class="text-2xl leading-tight text-ink">
      Promena lozinke
    </h2>
    <p class="mt-2 text-sm text-brown-200">
      Posle promene bićete odjavljeni sa svih ostalih uređaja.
    </p>

    <div class="mt-6 space-y-3">
      <FormField
        v-model="form.currentPassword"
        label="Trenutna lozinka"
        type="password"
        placeholder="Vaša trenutna lozinka"
        autocomplete="current-password"
        required
        :error="errors.currentPassword"
      />
      <div class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <FormField
          v-model="form.newPassword"
          label="Nova lozinka"
          type="password"
          placeholder="Najmanje 8 karaktera"
          autocomplete="new-password"
          required
          :error="errors.newPassword"
        />
        <FormField
          v-model="form.newPasswordConfirm"
          label="Potvrdite novu lozinku"
          type="password"
          placeholder="Ponovite novu lozinku"
          autocomplete="new-password"
          required
          :error="errors.newPasswordConfirm"
        />
      </div>
    </div>

    <p v-if="notice" class="mt-6 rounded-md border border-sun bg-sun-light/60 px-4 py-3 text-sm text-ink" role="alert">
      {{ notice }}
    </p>
    <p v-if="success" class="mt-6 flex items-center gap-2 rounded-md border border-forest/30 bg-forest/10 px-4 py-3 text-sm text-forest" role="status">
      <Icon name="lucide:check" class="size-4 shrink-0" />
      Lozinka je promenjena.
    </p>

    <BaseButton type="submit" size="lg" class="mt-8 w-full font-medium sm:w-auto" :disabled="pending" :aria-busy="pending">
      <template v-if="pending">
        Čuvamo…
      </template>
      <template v-else>
        Sačuvaj novu lozinku
        <Icon name="lucide:key-round" class="size-4" />
      </template>
    </BaseButton>
  </form>
</template>
