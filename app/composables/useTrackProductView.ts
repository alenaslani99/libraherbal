const STORAGE_KEY = 'libraherbal:views'
// seconds the page must be visible before it counts as a real view (not a quick bounce)
const DWELL_SECONDS = 10

interface SentViews {
  day: string
  slugs: string[]
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function readSent(): SentViews {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as SentViews | null
    if (saved?.day === today() && Array.isArray(saved.slugs)) return saved
  }
  catch {
    // blocked or corrupted storage — worst case the view is sent again
  }
  return { day: today(), slugs: [] }
}

function markSent(slug: string) {
  const sent = readSent()
  sent.slugs.push(slug)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sent))
  }
  catch {
    // storage full or blocked — the server's 6 h throttle still holds
  }
}

// Tells the server a signed-in user looked at this product (for the "still interested?" reminder email).
// Counts only time the tab is visible, sends after DWELL_SECONDS and at most once per product per day
// on this device. Guests send nothing. The page component is reused between products, so the slug is watched.
export function useTrackProductView(slug: MaybeRefOrGetter<string | undefined>) {
  if (import.meta.server) return
  const { loggedIn } = useAuth()

  let timer: ReturnType<typeof setInterval> | undefined

  function stop() {
    clearInterval(timer)
    timer = undefined
  }

  function start(current: string | undefined) {
    stop()
    if (!current || !loggedIn.value || readSent().slugs.includes(current)) return

    let seconds = 0
    timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      if (++seconds < DWELL_SECONDS) return
      stop()
      markSent(current)
      $fetch(`/api/products/${encodeURIComponent(current)}/view`, { method: 'POST' }).catch(() => {})
    }, 1000)
  }

  onMounted(() => {
    watch([() => toValue(slug), loggedIn], ([current]) => start(current), { immediate: true })
  })
  onBeforeUnmount(stop)
}
