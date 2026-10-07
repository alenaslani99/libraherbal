<script setup lang="ts">
definePageMeta({ middleware: 'admin', layout: 'admin' })
useSeoMeta({ title: 'Kategorije' })

const tabs = [
  { id: 'kategorije', label: 'Kategorije', icon: 'lucide:folder-tree' },
  { id: 'svrhe', label: 'Svrhe', icon: 'lucide:target' },
  { id: 'sastojci', label: 'Sastojci', icon: 'lucide:leaf' },
] as const
type Tab = typeof tabs[number]['id']

// the open tab lives in the URL (?tab=sastojci), so a reload or a shared link keeps it
const route = useRoute()
const router = useRouter()
const tab = computed<Tab>(() => tabs.find(t => t.id === route.query.tab)?.id ?? 'kategorije')
function select(id: Tab) {
  router.replace({ query: id === 'kategorije' ? {} : { tab: id } })
}
</script>

<template>
  <div>
    <h1 class="font-sans text-2xl font-semibold tracking-tight text-zinc-900">
      Kategorije
    </h1>
    <p class="mt-1 text-sm text-zinc-500">
      Kategorije, svrhe i sastojci proizvoda.
    </p>

    <div class="mt-6 flex gap-1 border-b border-zinc-200" role="tablist" aria-label="Katalog">
      <button
        v-for="t in tabs"
        :id="`tab-${t.id}`"
        :key="t.id"
        type="button"
        role="tab"
        :aria-selected="tab === t.id"
        :aria-controls="`panel-${t.id}`"
        class="-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors"
        :class="tab === t.id ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'"
        @click="select(t.id)"
      >
        <Icon :name="t.icon" class="size-4" />
        {{ t.label }}
      </button>
    </div>

    <div :id="`panel-${tab}`" role="tabpanel" :aria-labelledby="`tab-${tab}`" class="mt-6">
      <CategoriesPanel v-if="tab === 'kategorije'" />
      <PurposesPanel v-else-if="tab === 'svrhe'" />
      <IngredientsPanel v-else />
    </div>
  </div>
</template>
