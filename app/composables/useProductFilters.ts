import type { FilterOption } from '#shared/types/product'

export const ALL = 'sve'
const DEFAULT_SORT = 'popularnost'
export const PAGE_KEY = 'strana'

// Sort keys GET /api/products understands
export const sortOptions: FilterOption[] = [
  { value: 'popularnost', label: 'Popularnost' },
  { value: 'cena-rastuce', label: 'Cena: od najniže' },
  { value: 'cena-opadajuce', label: 'Cena: od najviše' },
  { value: 'naziv', label: 'Naziv: A–Z' },
]

// A filter value that lives in the URL (/cajevi?kategorija=imunitet&sortiraj=naziv&strana=2),
// so filtered views are linkable and the home page category blocks land pre-filtered.
// The default value is left out of the URL to keep it clean.
// Changing a filter or the sort drops ?strana, so the list starts again from page 1.
function useQueryParam(key: string, fallback: string, { resetsPage = true } = {}) {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get: () => {
      const value = route.query[key]
      return typeof value === 'string' && value ? value : fallback
    },
    set: (value: string) => {
      router.replace({
        query: {
          ...route.query,
          ...(resetsPage ? { [PAGE_KEY]: undefined } : {}),
          [key]: value === fallback ? undefined : value,
        },
      })
    },
  })
}

// Filter state for /proizvodi and the category pages. Filtering, sorting and paging happen on the server:
// pass `query` to GET /api/products. The product type is not a query param: each type has its own page
// (/med, /cajevi, /melemi — see app/data/categories.ts), so `category` comes from the page.
export function useProductFilters(category?: string) {
  const route = useRoute()
  const router = useRouter()

  const type = computed(() => category ?? ALL)
  const purpose = useQueryParam('kategorija', ALL)
  const sort = useQueryParam('sortiraj', DEFAULT_SORT)
  const pageParam = useQueryParam(PAGE_KEY, '1', { resetsPage: false })

  // anything that isn't a positive whole number counts as page 1
  const page = computed({
    get: () => {
      const n = Number(pageParam.value)
      return Number.isInteger(n) && n >= 1 ? n : 1
    },
    set: (value: number) => {
      pageParam.value = String(value)
    },
  })

  const query = computed(() => ({ vrsta: type.value, kategorija: purpose.value, sortiraj: sort.value, strana: page.value }))
  const isFiltered = computed(() => purpose.value !== ALL)

  // the category page itself stays; only the purpose filter and the page number are cleared
  function resetFilters() {
    router.replace({ query: { ...route.query, kategorija: undefined, [PAGE_KEY]: undefined } })
  }

  return { type, purpose, sort, page, query, isFiltered, resetFilters }
}
