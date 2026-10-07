<script setup lang="ts">
import type { AdminProduct } from '#shared/types/product'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const route = useRoute()
const id = String(route.params.id)

const { data: product, error } = await useFetch<AdminProduct>(`/api/admin/products/${encodeURIComponent(id)}`, { key: `admin-product-${id}` })

if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 500, message: 'Proizvod nije pronađen.', fatal: true })
}

useSeoMeta({ title: () => product.value?.name || 'Proizvod' })
</script>

<template>
  <!-- keyed by id: going from one product to another starts a fresh form -->
  <ProductForm v-if="product" :key="product.id" :product="product" />
</template>
