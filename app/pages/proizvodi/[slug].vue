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

useProductSeo(product)
useTrackProductView(() => product.value?.slug)

// view_item once per product: on the first load and on every client-side move to another product
// (the page component is reused between products, so the slug is watched)
onMounted(() => {
  watch(() => product.value?.slug, () => {
    const p = product.value
    if (p) trackEcommerce('view_item', { items: [analyticsItem(p, 1)] })
  }, { immediate: true })
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
    regularPrice: p.regularPrice,
    category: p.category,
    image: p.images[0]?.src ?? p.image,
  }, quantity)
}
</script>

<template>
  <div>
    <template v-if="product">
      <ProductDetailSection :product="product" @add="onAdd" />
      <ProductIngredients :ingredients="product.ingredients" :category="product.category" />
      <ProductReviews :slug="product.slug" :product-name="product.name" />
    </template>
    <ProductShowcase title="Preporučeni proizvodi" :products="recommended" />
    <NewsletterSection />
  </div>
</template>
