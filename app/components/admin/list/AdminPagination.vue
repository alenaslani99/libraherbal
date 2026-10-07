<script setup lang="ts">
// "26–50 od 73" + previous/next, under an admin list; hidden when everything fits on one page
const props = defineProps<{ page: number, pageSize: number, total: number }>()
const emit = defineEmits<{ change: [page: number] }>()

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const from = computed(() => (props.total ? (props.page - 1) * props.pageSize + 1 : 0))
const to = computed(() => Math.min(props.page * props.pageSize, props.total))
</script>

<template>
  <div v-if="total > pageSize" class="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-600">
    <span>{{ from }}–{{ to }} od {{ total }}</span>
    <div class="flex gap-2">
      <button
        type="button"
        :disabled="page <= 1"
        class="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium hover:bg-zinc-50 disabled:opacity-40"
        @click="emit('change', page - 1)"
      >
        <Icon name="lucide:chevron-left" class="size-4" />
        Prethodna
      </button>
      <button
        type="button"
        :disabled="page >= pages"
        class="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 font-medium hover:bg-zinc-50 disabled:opacity-40"
        @click="emit('change', page + 1)"
      >
        Sledeća
        <Icon name="lucide:chevron-right" class="size-4" />
      </button>
    </div>
  </div>
</template>
