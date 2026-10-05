<script setup lang="ts">
import type { BlogCollectionItem } from '@nuxt/content'

defineProps<{
  post: Pick<BlogCollectionItem, 'path' | 'title' | 'description' | 'date' | 'tags' | 'image' | 'imageAlt'>
}>()
</script>

<!-- Figma "Blog" featured card: bg Main Green, radius 24, photo left, honey title right -->
<template>
  <article class="group relative grid overflow-hidden rounded-3xl bg-forest text-white md:grid-cols-2">
    <NuxtImg
      :src="post.image"
      :alt="post.imageAlt ?? ''"
      width="520"
      height="420"
      sizes="xs:100vw sm:100vw md:50vw lg:520px"
      format="webp"
      fetchpriority="high"
      class="aspect-[4/3] size-full object-cover md:aspect-auto md:min-h-[340px]"
    />
    <div class="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
      <p class="text-[10px] uppercase leading-3 tracking-[0.04em] text-white/60">
        <template v-if="post.tags?.[0]">
          {{ post.tags[0] }} •
        </template>
        <time :datetime="post.date.slice(0, 10)">{{ formatPostDate(post.date) }}</time>
      </p>
      <h2 class="mt-3 text-[32px] leading-[1.05] tracking-[-0.02em] text-sun sm:text-[40px]">
        <NuxtLink :to="post.path" class="after:absolute after:inset-0">
          {{ post.title }}
        </NuxtLink>
      </h2>
      <p class="mt-4 max-w-[340px] text-sm font-light leading-5 text-white/80">
        {{ post.description }}
      </p>
      <p class="mt-8 flex items-center gap-1.5 text-xs font-medium transition-colors group-hover:text-sun" aria-hidden="true">
        Pročitajte više
        <Icon name="lucide:arrow-right" class="size-3.5" />
      </p>
    </div>
  </article>
</template>
