<script setup lang="ts">
// "Osnovni podaci" tab — read-only until editing the profile is designed
const { user } = useAuth()

const fields = computed(() => [
  { icon: 'lucide:user', label: 'Ime i prezime', value: `${user.value?.firstName} ${user.value?.lastName}` },
  { icon: 'lucide:mail', label: 'Email adresa', value: user.value?.email },
  { icon: 'lucide:phone', label: 'Telefon', value: user.value?.phone || '—' },
])
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
  </div>
</template>
