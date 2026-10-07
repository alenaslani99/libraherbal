<script setup lang="ts">
import { adminNav } from '~/data/admin'

useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const { user, logout } = useAuth()

// mobile drawer; closes on navigation and Escape
const open = ref(false)
watch(() => route.fullPath, () => (open.value = false))
function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

// /admin only matches itself; sections also match their sub-pages (/admin/blog/12)
function isActive(to: string) {
  return to === '/admin' ? route.path === '/admin' : route.path === to || route.path.startsWith(`${to}/`)
}

const initials = computed(() => {
  const u = user.value
  return u ? `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || u.email[0]!.toUpperCase() : ''
})

async function onLogout() {
  await logout()
  await navigateTo('/prijava')
}
</script>

<!-- Admin shell: own look (neutral zinc), not the storefront design. Sidebar left, content right. -->
<template>
  <!-- headings too: main.css gives h1–h3 the storefront's serif -->
  <div class="min-h-screen bg-zinc-50 font-sans text-zinc-900 [&_:is(h1,h2,h3)]:font-sans">
    <!-- mobile backdrop -->
    <Transition enter-from-class="opacity-0" leave-to-class="opacity-0" enter-active-class="transition-opacity" leave-active-class="transition-opacity">
      <div v-if="open" class="fixed inset-0 z-30 bg-zinc-900/40 lg:hidden" aria-hidden="true" @click="open = false" />
    </Transition>

    <aside
      id="admin-sidebar"
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 lg:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-zinc-200 px-5">
        <NuxtLink to="/admin" class="flex items-center gap-2.5">
          <span class="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
            <Icon name="lucide:leaf" class="size-4" />
          </span>
          <span class="leading-tight">
            <span class="block text-sm font-semibold">Libra Herbal</span>
            <span class="block text-xs text-zinc-500">Dashboard</span>
          </span>
        </NuxtLink>
        <button type="button" class="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden" aria-label="Zatvori meni" @click="open = false">
          <Icon name="lucide:x" class="size-5" />
        </button>
      </div>

      <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin navigacija">
        <div v-for="(group, i) in adminNav" :key="group.title ?? i">
          <p v-if="group.title" class="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            {{ group.title }}
          </p>
          <ul class="space-y-0.5">
            <li v-for="item in group.items" :key="item.to">
              <span
                v-if="item.soon"
                class="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400"
                aria-disabled="true"
              >
                <Icon :name="item.icon" class="size-4 shrink-0" />
                {{ item.label }}
                <span class="ml-auto rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">Uskoro</span>
              </span>
              <NuxtLink
                v-else
                :to="item.to"
                :aria-current="isActive(item.to) ? 'page' : undefined"
                class="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
                :class="isActive(item.to) ? 'bg-zinc-900 font-medium text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'"
              >
                <Icon :name="item.icon" class="size-4 shrink-0" />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>

      <div class="shrink-0 space-y-1 border-t border-zinc-200 p-3">
        <NuxtLink to="/" target="_blank" class="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
          <Icon name="lucide:external-link" class="size-4 shrink-0" />
          Pogledaj sajt
        </NuxtLink>
        <div v-if="user" class="flex items-center gap-3 rounded-md px-3 py-2">
          <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
            {{ initials }}
          </span>
          <span class="min-w-0 flex-1 leading-tight">
            <span class="block truncate text-sm font-medium">{{ user.firstName }} {{ user.lastName }}</span>
            <span class="block truncate text-xs text-zinc-500">{{ user.email }}</span>
          </span>
          <button
            type="button"
            class="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-red-600"
            aria-label="Odjavi se"
            title="Odjavi se"
            @click="onLogout"
          >
            <Icon name="lucide:log-out" class="size-4" />
          </button>
        </div>
      </div>
    </aside>

    <div class="lg:pl-64">
      <!-- mobile top bar -->
      <header class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          class="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100"
          aria-label="Otvori meni"
          aria-controls="admin-sidebar"
          :aria-expanded="open"
          @click="open = true"
        >
          <Icon name="lucide:menu" class="size-5" />
        </button>
        <span class="text-sm font-semibold">Libra Herbal <span class="font-normal text-zinc-500">Dashboard</span></span>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
