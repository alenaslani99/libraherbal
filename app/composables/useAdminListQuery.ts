// Admin lists keep their filters in the URL (?status=&q=&page=), so going back from a
// detail page returns to the same view. `search` is the text box: it reaches the URL after a short pause.
export function useAdminListQuery() {
  const route = useRoute()
  const router = useRouter()

  const status = computed(() => (typeof route.query.status === 'string' ? route.query.status : ''))
  const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
  const page = computed(() => Math.max(1, Number(route.query.page) || 1))

  function setQuery(next: { status?: string, q?: string, page?: number }) {
    const merged = { status: status.value, q: q.value, page: page.value, ...next }
    router.replace({
      query: {
        ...(merged.status ? { status: merged.status } : {}),
        ...(merged.q ? { q: merged.q } : {}),
        ...(merged.page > 1 ? { page: String(merged.page) } : {}),
      },
    })
  }

  const search = ref(q.value)
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(search, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => setQuery({ q: value.trim(), page: 1 }), 300)
  })
  onBeforeUnmount(() => clearTimeout(timer))

  return { status, q, page, search, setQuery }
}
