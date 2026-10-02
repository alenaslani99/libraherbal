<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const [{ data: product }, { data: recommended }] = await Promise.all([
  useProduct(slug),
  useRecommendedProducts(slug),
])

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

function onAdd({ variantId, quantity }: { variantId: number, quantity: number }) {
  const p = product.value
  const variant = p?.variants.find(v => v.id === variantId)
  if (!p || !variant) return
  cart.add({
    variantId,
    slug: p.slug,
    name: p.name,
    variantLabel: variant.label,
    price: variant.price,
    image: p.images[0]?.src ?? '',
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
