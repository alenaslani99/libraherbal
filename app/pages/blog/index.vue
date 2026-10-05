<script setup lang="ts">
// 9 = three full rows of the 3-column grid
const PAGE_SIZE = 9

const route = useRoute()

const { data: posts } = await useAsyncData('blog-list', () =>
  queryCollection('blog')
    .select('path', 'title', 'description', 'date', 'tags', 'image', 'imageAlt', 'featured', 'draft')
    .order('date', 'DESC')
    .all(), { default: () => [] })

const published = computed(() => posts.value.filter(post => !post.draft))

// the post marked featured: true (newest one if several), otherwise simply the newest post
const featured = computed(() => published.value.find(post => post.featured) ?? published.value[0])
const rest = computed(() => published.value.filter(post => post !== featured.value))

const pageCount = computed(() => Math.max(1, Math.ceil(rest.value.length / PAGE_SIZE)))
const page = computed(() => {
  const n = Number(route.query.strana)
  return Number.isInteger(n) && n >= 1 && n <= pageCount.value ? n : 1
})
const pagePosts = computed(() => rest.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

usePageSeo({
  title: 'Blog',
  description: 'Praktični vodiči o medu, bilju i malim navikama za svakodnevnu ravnotežu. Saveti, recepti i priče iz Libra Herbal kuhinje.',
})

const absolute = useAbsoluteUrl()
useJsonLd('blog', () => ({
  '@type': 'Blog',
  'url': absolute('/blog'),
  'name': 'Blog | Libra Herbal',
  'blogPost': published.value.map(post => ({
    '@type': 'BlogPosting',
    'headline': post.title,
    'url': absolute(post.path),
    'datePublished': post.date,
  })),
}))
</script>

<template>
  <div>
    <!-- Figma "Blog" hero: bg Main Green, padding 72/128 -->
    <section class="bg-forest">
      <div class="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-16 lg:py-[72px] xl:px-32">
        <PageHeading eyebrow="Blog" title="Istražite naš" title-italic="herbarijum." light />
        <p class="mt-6 max-w-[360px] text-sm font-light text-white">
          Praktični vodiči o medu, bilju i malim navikama za svakodnevnu ravnotežu.
        </p>
      </div>
    </section>

    <section class="bg-pale-beige">
      <div class="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-16 lg:py-[72px] xl:px-32">
        <div class="mx-auto max-w-[1020px]">
          <p v-if="!featured" class="py-12 text-center text-sm text-brown-200">
            Uskoro prve objave.
          </p>

          <BlogFeaturedCard v-if="featured && page === 1" :post="featured" />

          <ul v-if="pagePosts.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" :class="{ 'mt-10 lg:mt-12': featured && page === 1 }">
            <li v-for="post in pagePosts" :key="post.path" class="flex">
              <BlogCard :post="post" class="w-full" />
            </li>
          </ul>

          <ProductPagination :page="page" :page-count="pageCount" class="mt-12" />
        </div>
      </div>
    </section>

    <NewsletterSection />
  </div>
</template>
