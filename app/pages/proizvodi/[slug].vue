<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const [{ data: product, error }, { data: recommended }] = await Promise.all([
  useProduct(slug),
  useRecommendedProducts(slug),
])

// useProduct gives null for an unknown slug; any other failure (DB down) is a real error, not a 404
if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 500, message: 'Proizvod trenutno nije dostupan', fatal: true })
}
if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Proizvod nije pronađen', fatal: true })
}

useSeoMeta({
  title: () => product.value?.name,
  description: () => product.value?.description,
  ogTitle: () => `${product.value?.name} · Libra Herbal`,
  ogDescription: () => product.value?.description,
  ogImage: () => product.value?.images[0]?.src,
})

const cart = useCart()

function onAdd(quantity: number) {
  const p = product.value
  if (!p) return
  cart.add({
    productId: p.id,
    slug: p.slug,
    name: p.name,
    weight: p.weight,
    price: p.price,
    image: p.images[0]?.src ?? p.image,
  }, quantity)
}
</script>

<template>
  <div>
    <template v-if="product">
      <ProductDetailSection :product="product" @add="onAdd" />
      <ProductIngredients :ingredients="product.ingredients" :category="product.category" />
    </template>
    <ProductShowcase title="Preporučeni proizvodi" :products="recommended" />
    <NewsletterSection />
  </div>
</template>
