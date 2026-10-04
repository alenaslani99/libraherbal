<script setup lang="ts">
// Account shell: heading, logout and tabs; each tab is a child route (/nalog, /nalog/porudzbine, /nalog/lozinka)
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: 'Moj nalog', robots: 'noindex' })

const { user, isAdmin, logout } = useAuth()

const tabs = [
  { to: '/nalog', label: 'Osnovni podaci', icon: 'lucide:user' },
  { to: '/nalog/porudzbine', label: 'Istorija porudžbina', icon: 'lucide:package' },
  { to: '/nalog/lozinka', label: 'Promena lozinke', icon: 'lucide:key-round' },
]

const loggingOut = ref(false)

async function onLogout() {
  loggingOut.value = true
  try {
    await logout()
  }
  finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <section class="bg-pale-beige">
    <div class="mx-auto max-w-[1440px] px-4 pt-12 pb-16 sm:px-6 lg:px-16 lg:pt-[72px] lg:pb-24 xl:px-32">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <PageHeading eyebrow="Moj nalog" title="Zdravo," :title-italic="`${user?.firstName}.`" />

        <div class="flex flex-wrap items-center gap-3">
          <BaseButton v-if="isAdmin" to="/admin" variant="forest" size="lg" class="font-medium">
            <Icon name="lucide:layout-dashboard" class="size-4" />
            Admin panel
          </BaseButton>
          <button
            type="button"
            class="inline-flex h-11 items-center gap-2 rounded-full border border-red-700 px-5 text-base font-medium text-red-700 transition-colors duration-200 hover:bg-red-700 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-700/20 disabled:pointer-events-none disabled:opacity-60"
            :disabled="loggingOut"
            :aria-busy="loggingOut"
            @click="onLogout"
          >
            <Icon name="lucide:log-out" class="size-4" />
            {{ loggingOut ? 'Odjavljujemo vas…' : 'Odjavi se' }}
          </button>
        </div>
      </div>

      <nav aria-label="Moj nalog" class="mt-10 overflow-x-auto border-b border-line lg:mt-14">
        <ul class="flex min-w-max gap-8">
          <li v-for="tab in tabs" :key="tab.to">
            <NuxtLink
              :to="tab.to"
              exact-active-class="is-active"
              class="-mb-px flex items-center gap-2 border-b-2 border-transparent pb-3 text-sm text-ink transition-colors hover:text-forest [&.is-active]:border-forest [&.is-active]:font-semibold [&.is-active]:text-forest"
            >
              <Icon :name="tab.icon" class="size-4" />
              {{ tab.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="mt-10">
        <NuxtPage />
      </div>
    </div>
  </section>
</template>
