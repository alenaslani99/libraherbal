import type { Ref, WatchSource } from 'vue'

// Client-side paging for admin lists that load everything at once (products, purposes,
// ingredients…). Goes back to page 1 when any `resetOn` source changes (filter, search);
// `reveal(index)` jumps to the page that holds that item of the full list.
export function usePagedList<T>(list: Ref<T[]>, { pageSize = 20, resetOn = [] as WatchSource[] } = {}) {
  const page = ref(1)
  const pageCount = computed(() => Math.max(1, Math.ceil(list.value.length / pageSize)))
  const offset = computed(() => (page.value - 1) * pageSize)
  const items = computed(() => list.value.slice(offset.value, offset.value + pageSize))

  // the list got shorter (delete, filter): stay on the last page that exists
  watch(pageCount, (count) => {
    if (page.value > count) page.value = count
  })
  if (resetOn.length) watch(resetOn, () => (page.value = 1))

  function reveal(index: number) {
    if (index >= 0) page.value = Math.floor(index / pageSize) + 1
  }

  return { page, pageSize, offset, items, reveal }
}
