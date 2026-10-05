<script setup lang="ts">
import type { BlogCollectionItem } from '@nuxt/content'

defineProps<{
  post: Pick<BlogCollectionItem, 'path' | 'title' | 'description' | 'date' | 'tags' | 'image' | 'imageAlt'>
}>()
</script>

<!-- Figma "Blog" grid card: bg Main Green, radius 16, photo on top, tag • date, Fraunces title, excerpt, "Pročitajte više" -->
<template>
  <article class="group relative flex flex-col overflow-hidden rounded-2xl bg-forest text-white">
    <NuxtImg
      :src="post.image"
      :alt="post.imageAlt ?? ''"
      width="400"
      height="260"
      sizes="xs:100vw sm:50vw md:50vw lg:33vw xl:400px"
      format="webp"
      loading="lazy"
      class="aspect-[20/13] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
    />
    <div class="flex flex-1 flex-col p-4">
      <p class="text-[10px] uppercase leading-3 tracking-[0.04em] text-white/60">
        <template v-if="post.tags?.[0]">
          {{ post.tags[0] }} •
        </template>
        <time :datetime="post.date.slice(0, 10)">{{ formatPostDate(post.date) }}</time>
      </p>
      <h3 class="mt-2 text-xl leading-tight">
        <NuxtLink :to="post.path" class="after:absolute after:inset-0">
          {{ post.title }}
        </NuxtLink>
      </h3>
      <p class="mt-2 line-clamp-3 text-xs font-light leading-4 text-white/75">
        {{ post.description }}
      </p>
      <p class="mt-auto flex items-center gap-1.5 pt-4 text-xs font-medium transition-colors group-hover:text-sun" aria-hidden="true">
        Pročitajte više
        <Icon name="lucide:arrow-right" class="size-3.5" />
      </p>
    </div>
  </article>
</template>
