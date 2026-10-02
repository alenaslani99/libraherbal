import type { ShopProduct } from '~/data/products-mock'

export const ALL = 'sve'
const DEFAULT_SORT = 'popularnost'

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

// Mock-only: prices come as display strings ("1.200"). The backend will sort on its numeric column.
const priceValue = (product: ShopProduct) => Number(product.price.replace(/\./g, ''))

const sorters: Record<string, (a: ShopProduct, b: ShopProduct) => number> = {
  'popularnost': (a, b) => b.popularity - a.popularity,
  'cena-rastuce': (a, b) => priceValue(a) - priceValue(b),
  'cena-opadajuce': (a, b) => priceValue(b) - priceValue(a),
  'naziv': (a, b) => a.name.localeCompare(b.name, 'sr'),
}

export function useProductFilters(products: MaybeRefOrGetter<ShopProduct[]>) {
  const type = useQueryParam('vrsta', ALL)
  const purpose = useQueryParam('kategorija', ALL)
  const sort = useQueryParam('sortiraj', DEFAULT_SORT)

  const results = computed(() => {
    const sorter = sorters[sort.value] ?? sorters[DEFAULT_SORT]!
    return toValue(products)
      .filter(p => type.value === ALL || p.type === type.value)
      .filter(p => purpose.value === ALL || p.purposes.includes(purpose.value))
      .sort(sorter)
  })

  const isFiltered = computed(() => type.value !== ALL || purpose.value !== ALL)

  function resetFilters() {
    type.value = ALL
    purpose.value = ALL
  }

  return { type, purpose, sort, results, isFiltered, resetFilters }
}
