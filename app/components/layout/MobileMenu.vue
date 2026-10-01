<script setup lang="ts">
import type { NavLink } from '~/data/navigation'

defineProps<{ links: NavLink[] }>()

const open = defineModel<boolean>('open', { default: false })
const route = useRoute()

watch(() => route.fullPath, () => {
  open.value = false
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-50 bg-ink/50 lg:hidden" @click="open = false" />
    </Transition>

    <Transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="-translate-x-full"
      leave-active-class="transition-transform duration-300"
      leave-to-class="-translate-x-full"
    >
      <aside
        v-if="open"
        class="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-forest p-6 shadow-xl lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Meni"
      >
        <div class="mb-8 flex items-center justify-between">
          <AppLogo light />
          <button type="button" class="-mr-2 p-2 text-white" aria-label="Zatvori meni" @click="open = false">
            <Icon name="lucide:x" class="size-6" />
          </button>
        </div>

        <nav aria-label="Mobilna navigacija">
          <ul class="space-y-1">
            <li v-for="link in links" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="block rounded-lg px-3 py-3 text-base font-medium text-white/90 hover:bg-white/10"
                exact-active-class="bg-white/10 text-sun"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </aside>
    </Transition>
  </Teleport>
</template>
