<script setup lang="ts">
import type { AdminBlogPost } from '#shared/types/blog'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const route = useRoute()
const id = String(route.params.id)

const { data: post, error } = await useFetch<AdminBlogPost>(`/api/admin/blog/${encodeURIComponent(id)}`, { key: `admin-blog-${id}` })

if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 500, message: 'Objava nije pronađena.', fatal: true })
}

useSeoMeta({ title: () => post.value?.title || 'Objava' })
</script>

<template>
  <!-- keyed by id: going from one post to another starts a fresh form -->
  <BlogPostForm v-if="post" :key="post.id" :post="post" />
</template>
