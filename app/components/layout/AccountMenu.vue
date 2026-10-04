<script setup lang="ts">
// Header account icon: guests go to /prijava; signed-in users get a small menu.
// Placeholder styling until the designer delivers the account menu.
const { user, loggedIn, isAdmin, logout } = useAuth()

const open = ref(false)
const root = ref<HTMLElement>()
const id = useId()

function close() {
  open.value = false
}

function onPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) close()
}

watch(open, (value) => {
  if (value) document.addEventListener('pointerdown', onPointerDown)
  else document.removeEventListener('pointerdown', onPointerDown)
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown))

// close when a menu link navigates
const route = useRoute()
watch(() => route.fullPath, close)

async function onLogout() {
  close()
  await logout()
}
</script>

<template>
  <NuxtLink v-if="!loggedIn" to="/prijava" class="transition-colors hover:text-forest" aria-label="Prijava">
    <Icon name="lucide:user" class="size-6" />
  </NuxtLink>

  <div v-else ref="root" class="relative" @keydown.esc="close">
    <button
      type="button"
      class="relative flex transition-colors hover:text-forest"
      aria-label="Moj nalog"
      aria-haspopup="true"
      :aria-expanded="open"
      :aria-controls="id"
      @click="open = !open"
    >
      <Icon name="lucide:user" class="size-6" />
      <span class="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-pale-beige bg-forest" aria-hidden="true" />
    </button>

    <div
      v-show="open"
      :id="id"
      class="absolute right-0 top-full z-50 mt-3 w-56 rounded-md border border-line bg-pale-beige py-2 text-sm shadow-lg"
    >
      <div class="border-b border-line px-4 pb-2.5 pt-1">
        <p class="font-semibold text-ink">
          {{ user?.firstName }} {{ user?.lastName }}
        </p>
        <p class="truncate text-xs text-brown-200">
          {{ user?.email }}
        </p>
      </div>
      <NuxtLink v-if="isAdmin" to="/admin" class="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-white/50 hover:text-forest">
        <Icon name="lucide:layout-dashboard" class="size-4" />
        Admin panel
      </NuxtLink>
      <button type="button" class="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-white/50 hover:text-forest" @click="onLogout">
        <Icon name="lucide:log-out" class="size-4" />
        Odjavi se
      </button>
    </div>
  </div>
</template>
