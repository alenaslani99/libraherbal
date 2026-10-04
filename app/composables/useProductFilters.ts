import type { FilterOption } from '#shared/types/product'

export const ALL = 'sve'
const DEFAULT_SORT = 'popularnost'

// Sort keys GET /api/products understands
export const sortOptions: FilterOption[] = [
  { value: 'popularnost', label: 'Popularnost' },
  { value: 'cena-rastuce', label: 'Cena: od najniže' },
  { value: 'cena-opadajuce', label: 'Cena: od najviše' },
  { value: 'naziv', label: 'Naziv: A–Z' },
]

// A filter value that lives in the URL (?vrsta=med&kategorija=imunitet&sortiraj=naziv),
// so filtered views are linkable and the home page category blocks land pre-filtered.
// The default value is left out of the URL to keep it clean.
function useQueryParam(key: string, fallback: string) {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get: () => {
      const value = route.query[key]
      return typeof value === 'string' && value ? value : fallback
    },
    set: (value: string) => {
      router.replace({ query: { ...route.query, [key]: value === fallback ? undefined : value } })
    },
  })
}

// Filter state for /proizvodi. Filtering and sorting happen on the server: pass `query` to GET /api/products.
export function useProductFilters() {
  const type = useQueryParam('vrsta', ALL)
  const purpose = useQueryParam('kategorija', ALL)
  const sort = useQueryParam('sortiraj', DEFAULT_SORT)

  const query = computed(() => ({ vrsta: type.value, kategorija: purpose.value, sortiraj: sort.value }))
  const isFiltered = computed(() => type.value !== ALL || purpose.value !== ALL)

  function resetFilters() {
    type.value = ALL
    purpose.value = ALL
  }

  return { type, purpose, sort, query, isFiltered, resetFilters }
}
