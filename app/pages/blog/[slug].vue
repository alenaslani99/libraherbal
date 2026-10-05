<script setup lang="ts">
import type { BlogPost } from '#shared/types/blog'

const route = useRoute()
const slug = String(route.params.slug)

const { data: post, error } = await useFetch<BlogPost>(`/api/blog/${encodeURIComponent(slug)}`, { key: `blog-${slug}` })

if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Objava nije pronađena', fatal: true })
}
if (error.value || !post.value) {
  throw createError({ statusCode: error.value?.statusCode ?? 500, message: 'Objava trenutno nije dostupna', fatal: true })
}

const absolute = useAbsoluteUrl()
const url = absolute(route.path)
const date = formatPostDate(post.value.date)

usePageSeo({
  title: post.value.title,
  description: post.value.description,
  image: post.value.image,
})
useSeoMeta({ ogType: 'article', articlePublishedTime: post.value.date })

useJsonLd('article', {
  '@type': 'BlogPosting',
  'headline': post.value.title,
  'description': post.value.description,
  'image': absolute(post.value.image),
  'datePublished': post.value.date,
  'author': { '@type': 'Organization', 'name': post.value.author },
  'publisher': { '@type': 'Organization', 'name': 'Libra Herbal', 'logo': absolute('/assets/img/logo.svg') },
  'mainEntityOfPage': url,
})
useJsonLd('breadcrumb', breadcrumbLd([['Početna', '/'], ['Blog', '/blog'], [post.value.title, route.path]], absolute))

const shareLinks = [
  { label: 'Facebook', icon: 'simple-icons:facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { label: 'X', icon: 'simple-icons:x', href: `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.value.title)}` },
]

// Instagram has no share link: copy the URL so it can be pasted into a story or message
const copied = ref(false)
async function copyLink() {
  try {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
  catch {}
}
</script>

<template>
  <div v-if="post">
    <!-- Figma "Blog Post" hero: bg Main Green, tag pills, title, excerpt, author row -->
    <section class="bg-forest text-white">
      <div class="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-16 lg:py-[72px] xl:px-32">
        <ul v-if="post.tags.length" class="flex flex-wrap gap-2">
          <li v-for="tag in post.tags" :key="tag" class="rounded-full bg-brown-200 px-3 py-1 text-[11px] leading-none text-ink">
            {{ tag }}
          </li>
        </ul>
        <h1 class="mt-5 max-w-[640px] text-[36px] leading-[1.1] tracking-[-0.02em] sm:text-[44px] lg:text-[48px]">
          {{ post.title }}
        </h1>
        <p class="mt-5 max-w-[520px] text-sm font-light text-white/85">
          {{ post.description }}
        </p>
        <div class="mt-8 flex items-center gap-3 text-xs text-white/75 lg:mt-12">
          <span class="flex size-8 items-center justify-center rounded-full bg-pale-beige text-forest">
            <Icon name="lucide:leaf" class="size-4" />
          </span>
          <span>{{ post.author }}</span>
          <span aria-hidden="true">•</span>
          <time :datetime="post.date">{{ date }}</time>
        </div>
      </div>
    </section>

    <section class="bg-pale-beige">
      <div class="mx-auto grid max-w-[1440px] gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,765px)_224px] lg:justify-between lg:gap-16 lg:px-16 lg:py-[72px] xl:px-32">
        <article>
          <BlogImage
            :src="post.image"
            :alt="post.imageAlt"
            :width="765"
            :height="450"
            sizes="xs:100vw sm:100vw md:100vw lg:765px"
            priority
            class="aspect-[17/10] w-full rounded-2xl object-cover"
          />
          <MDC :value="post.body" tag="div" class="blog-prose mt-10" />
        </article>

        <aside class="space-y-10 lg:sticky lg:top-24 lg:self-start">
          <div v-if="post.products.length">
            <h2 class="text-xl leading-tight text-ink">
              Preporučeni proizvodi
            </h2>
            <ul class="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-1">
              <li v-for="product in post.products" :key="product.id">
                <ProductCard :product="product" />
              </li>
            </ul>
          </div>

          <div>
            <h2 class="text-xl leading-tight text-ink">
              Podelite objavu
            </h2>
            <ul class="mt-3 flex items-center gap-4 text-ink">
              <li v-for="link in shareLinks" :key="link.label">
                <a
                  :href="link.href"
                  :aria-label="`Podelite na: ${link.label}`"
                  target="_blank"
                  rel="noopener"
                  class="block transition-colors hover:text-forest"
                >
                  <Icon :name="link.icon" class="size-5" />
                </a>
              </li>
              <li>
                <button
                  type="button"
                  :aria-label="copied ? 'Link je kopiran' : 'Kopirajte link (Instagram)'"
                  class="flex items-center gap-1.5 transition-colors hover:text-forest"
                  @click="copyLink"
                >
                  <Icon :name="copied ? 'lucide:check' : 'simple-icons:instagram'" class="size-5" />
                  <span v-if="copied" class="text-xs">Kopirano</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>

    <NewsletterSection />
  </div>
</template>
