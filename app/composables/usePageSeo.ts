// Turns a site path ("/med", "/assets/img/x.jpg") into an absolute URL on the public domain
// (runtimeConfig.public.siteUrl). Already-absolute URLs pass through.
export function useAbsoluteUrl() {
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  return (path: string) => (/^https?:\/\//.test(path) ? path : `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`)
}

interface PageSeo {
  // without the brand: titleTemplate adds " | Libra Herbal"
  title: MaybeRefOrGetter<string | undefined>
  // ~150–160 characters, shown under the title in Google
  description: MaybeRefOrGetter<string | undefined>
  // social preview image; defaults to /og-image.jpg (1200×630)
  image?: MaybeRefOrGetter<string | undefined>
  noindex?: boolean
}

// Title, description, Open Graph and a canonical URL for an indexable page.
// Canonical = path, plus ?strana when > 1: sort and filter variants (?sortiraj, ?kategorija) all point
// to the clean URL, so Google sees one page per listing instead of dozens of duplicates.
export function usePageSeo(seo: PageSeo) {
  const route = useRoute()
  const absolute = useAbsoluteUrl()

  const canonical = computed(() => {
    const page = Number(route.query.strana)
    return absolute(Number.isInteger(page) && page > 1 ? `${route.path}?strana=${page}` : route.path)
  })

  useSeoMeta({
    title: () => toValue(seo.title),
    description: () => toValue(seo.description),
    ogTitle: () => toValue(seo.title) && `${toValue(seo.title)} | Libra Herbal`,
    ogDescription: () => toValue(seo.description),
    ogUrl: canonical,
    ogImage: () => absolute(toValue(seo.image) || '/og-image.jpg'),
    robots: seo.noindex ? 'noindex, follow' : undefined,
  })

  useHead({ link: [{ rel: 'canonical', href: canonical }] })
}

// Structured data for Google (Product, Organization, BreadcrumbList…), rendered in the SSR HTML.
// `key` keeps one script per type when the page re-renders.
export function useJsonLd(key: string, data: MaybeRefOrGetter<Record<string, unknown> | null | undefined>) {
  useHead({
    script: [{
      key: `ld-${key}`,
      type: 'application/ld+json',
      // "<" escaped so text in the data can never close the script tag
      innerHTML: () => {
        const value = toValue(data)
        return value ? JSON.stringify({ '@context': 'https://schema.org', ...value }).replace(/</g, '\\u003c') : ''
      },
    }],
  })
}

// BreadcrumbList from [name, path] pairs: Početna › Čajevi › UroBalans
export function breadcrumbLd(items: [name: string, path: string][], absolute: (path: string) => string) {
  return {
    '@type': 'BreadcrumbList',
    'itemListElement': items.map(([name, path], i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': name,
      'item': absolute(path),
    })),
  }
}
