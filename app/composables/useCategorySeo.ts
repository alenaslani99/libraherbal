import type { CategoryPage } from '~/data/categories'
import { productsPage } from '~/data/products-page'

// SEO for a product listing: /proizvodi (no category) or a category page (/med, /cajevi, /melemi).
// Title, description, canonical, plus CollectionPage + BreadcrumbList structured data.
export function useCategorySeo(category?: CategoryPage) {
  const absolute = useAbsoluteUrl()
  const title = category?.title ?? productsPage.title
  const description = category?.description ?? productsPage.description
  const path = category?.path ?? '/proizvodi'

  usePageSeo({ title, description, image: category?.hero.images[0] ?? productsPage.hero.images[0] })

  const crumbs: [string, string][] = [['Početna', '/'], ['Proizvodi', '/proizvodi']]
  if (category) crumbs.push([category.name, category.path])

  useJsonLd('collection', {
    '@type': 'CollectionPage',
    'name': title,
    'description': description,
    'url': absolute(path),
    'inLanguage': 'sr',
  })
  useJsonLd('breadcrumb', breadcrumbLd(crumbs, absolute))
}
