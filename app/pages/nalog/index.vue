<script setup lang="ts">
// "Osnovni podaci" tab — read-only until editing the profile is designed
const { user } = useAuth()

const fields = computed(() => [
  { icon: 'lucide:user', label: 'Ime i prezime', value: `${user.value?.firstName} ${user.value?.lastName}` },
  { icon: 'lucide:mail', label: 'Email adresa', value: user.value?.email },
  { icon: 'lucide:phone', label: 'Telefon', value: user.value?.phone || '—' },
])

// Reminder emails (abandoned cart, viewed products): the way back after "odjavite se" in such an email
const savingReminders = ref(false)
const remindersError = ref('')

async function toggleReminders() {
  if (!user.value || savingReminders.value) return
  const enabled = !user.value.reminders
  savingReminders.value = true
  remindersError.value = ''
  try {
    await $fetch('/api/account/reminders', { method: 'PUT', body: { enabled } })
    user.value.reminders = enabled
  }
  catch (error) {
    remindersError.value = apiError(error).message || 'Podešavanje nije sačuvano. Pokušajte ponovo.'
  }
  finally {
    savingReminders.value = false
  }
}
</script>

<template>
  <div class="max-w-[643px]">
    <h2 class="text-2xl leading-tight text-ink">
      Osnovni podaci
    </h2>
    <dl class="mt-6 divide-y divide-line rounded-xl border border-line bg-white/30">
      <div v-for="field in fields" :key="field.label" class="flex items-start gap-4 px-5 py-4 sm:px-6">
        <Icon :name="field.icon" class="mt-0.5 size-5 shrink-0 text-forest" />
        <div class="min-w-0">
          <dt class="text-xs font-semibold text-brown-200">
            {{ field.label }}
          </dt>
          <dd class="mt-1 break-words text-sm text-ink">
            {{ field.value }}
          </dd>
        </div>
      </div>
    </dl>

    <h2 class="mt-12 text-2xl leading-tight text-ink">
      Email podsetnici
    </h2>
    <div class="mt-6 flex items-start gap-4 rounded-xl border border-line bg-white/30 px-5 py-4 sm:px-6">
      <Icon name="lucide:bell" class="mt-0.5 size-5 shrink-0 text-forest" />
      <div class="min-w-0 flex-1">
        <p id="reminders-label" class="text-sm font-semibold text-ink">
          Podsetnici o korpi i pregledanim proizvodima
        </p>
        <p class="mt-1 text-xs leading-5 text-brown-200">
          Povremeno vam pošaljemo email kada ostavite proizvode u korpi ili pogledate proizvod bez poručivanja,
          najviše jedan u nekoliko dana.
        </p>
        <p v-if="remindersError" class="mt-2 text-xs text-red-700" role="alert">
          {{ remindersError }}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="user?.reminders"
        aria-labelledby="reminders-label"
        :disabled="savingReminders"
        class="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun disabled:opacity-50"
        :class="user?.reminders ? 'bg-forest' : 'bg-brown-200/50'"
        @click="toggleReminders"
      >
        <span class="inline-block size-5 rounded-full bg-white shadow transition-transform" :class="user?.reminders ? 'translate-x-5.5' : 'translate-x-0.5'" />
      </button>
    </div>
  </div>
</template>
