<script setup lang="ts">
import type { AdminBlogPost, AdminProductOption } from '#shared/types/blog'
import { blogPostSchema, type BlogPostInput } from '#shared/schemas/blog'

const props = defineProps<{
  // undefined = new post
  post?: AdminBlogPost
}>()

const { data: products } = await useFetch<AdminProductOption[]>('/api/admin/products/options', {
  key: 'admin-product-options',
  default: () => [],
})

function toForm(post?: AdminBlogPost): Required<BlogPostInput> {
  return {
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    description: post?.description ?? '',
    body: post?.body ?? '',
    image: post?.image ?? '',
    imageAlt: post?.imageAlt ?? '',
    tags: [...(post?.tags ?? [])],
    author: post?.author ?? 'Libra Herbal tim',
    featured: post?.featured ?? false,
    status: post?.status ?? 'draft',
    publishedAt: post?.publishedAt ?? '',
    productIds: [...(post?.productIds ?? [])],
  }
}

const form = reactive(toForm(props.post))
const saved = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== saved.value)

const errors = ref<Record<string, string>>({})
const notice = ref('')
const success = ref('')
const pending = ref(false)

// the URL follows the title until it is edited by hand (or the post already has one)
const slugTouched = ref(Boolean(props.post))
watch(() => form.title, (title) => {
  if (!slugTouched.value) form.slug = slugify(title)
})

// tags: type and press Enter or comma
const tagInput = ref('')
function addTag() {
  const tag = tagInput.value.replace(/,/g, '').trim()
  if (tag && !form.tags.includes(tag) && form.tags.length < 8) form.tags.push(tag)
  tagInput.value = ''
}
function onTagKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addTag()
  }
  else if (event.key === 'Backspace' && !tagInput.value) {
    form.tags.pop()
  }
}

// recommended products: search + checkboxes, max 6, in the order they were picked
const productSearch = ref('')
const filteredProducts = computed(() => {
  const q = productSearch.value.trim().toLowerCase()
  return q ? products.value.filter(p => p.name.toLowerCase().includes(q)) : products.value
})
const productName = (id: number) => products.value.find(p => p.id === id)?.name ?? `#${id}`
function toggleProduct(id: number) {
  const i = form.productIds.indexOf(id)
  if (i >= 0) form.productIds.splice(i, 1)
  else if (form.productIds.length < 6) form.productIds.push(id)
}

const tab = ref<'edit' | 'preview'>('edit')

async function save(status?: 'draft' | 'published') {
  notice.value = ''
  success.value = ''
  if (pending.value) return
  addTag()

  // the status only changes once the save went through
  const result = blogPostSchema.safeParse({ ...form, status: status ?? form.status })
  errors.value = result.success ? {} : fieldErrors(result.error)
  if (!result.success) {
    notice.value = 'Proverite označena polja.'
    return
  }

  pending.value = true
  try {
    if (props.post) {
      await $fetch(`/api/admin/blog/${props.post.id}`, { method: 'PUT', body: result.data })
      form.status = result.data.status
      saved.value = JSON.stringify(form)
      success.value = form.status === 'published' ? 'Sačuvano i objavljeno.' : 'Sačuvano kao nacrt.'
      await refreshNuxtData(`admin-blog-${props.post.id}`)
    }
    else {
      const { id } = await $fetch<{ id: number }>('/api/admin/blog', { method: 'POST', body: result.data })
      form.status = result.data.status
      saved.value = JSON.stringify(form)
      await navigateTo({ path: `/admin/blog/${id}`, query: { sacuvano: '1' } })
    }
  }
  catch (error) {
    const { fields, message } = apiError(error)
    errors.value = fields
    notice.value = message
  }
  finally {
    pending.value = false
  }
}

// Ctrl+S saves without changing the status
function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    save()
  }
}
function onBeforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value) event.preventDefault()
}
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})
onBeforeRouteLeave(() => {
  if (dirty.value && !pending.value && !window.confirm('Imate nesačuvane izmene. Da li želite da napustite stranicu?')) return false
})

const route = useRoute()
if (route.query.sacuvano) success.value = 'Objava je napravljena.'

const input = 'block w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900'
const inputBorder = (field: string) => errors.value[field] ? 'border-red-500' : 'border-zinc-300'
const label = 'mb-1.5 block text-sm font-medium text-zinc-700'
const card = 'rounded-lg border border-zinc-200 bg-white p-4'
</script>

<template>
  <form novalidate @submit.prevent="save()">
    <!-- top bar: back, title, actions -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <NuxtLink to="/admin/blog" class="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" aria-label="Nazad na listu">
        <Icon name="lucide:arrow-left" class="size-5" />
      </NuxtLink>
      <h1 class="min-w-0 flex-1 truncate font-sans text-2xl font-semibold tracking-tight text-zinc-900">
        {{ post ? form.title || 'Bez naslova' : 'Nova objava' }}
      </h1>
      <span v-if="dirty" class="text-xs text-amber-600">Nesačuvane izmene</span>
      <a
        v-if="post?.status === 'published'"
        :href="`/blog/${post.slug}`"
        target="_blank"
        class="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        <Icon name="lucide:external-link" class="size-4" />
        Na sajtu
      </a>
      <button
        type="button"
        :disabled="pending"
        class="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        @click="save('draft')"
      >
        Sačuvaj nacrt
      </button>
      <button
        type="button"
        :disabled="pending"
        class="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        @click="save('published')"
      >
        <Icon :name="pending ? 'lucide:loader-circle' : 'lucide:send'" class="size-4" :class="{ 'animate-spin': pending }" />
        {{ post?.status === 'published' ? 'Sačuvaj i objavi' : 'Objavi' }}
      </button>
    </div>

    <p v-if="notice" class="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      <Icon name="lucide:circle-alert" class="size-4 shrink-0" />
      {{ notice }}
    </p>
    <p v-else-if="success" class="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
      <Icon name="lucide:check" class="size-4 shrink-0" />
      {{ success }}
    </p>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <!-- main column -->
      <div class="min-w-0 space-y-5">
        <div>
          <label for="post-title" :class="label">Naslov</label>
          <input id="post-title" v-model="form.title" type="text" maxlength="160" placeholder="Kopriva u svakodnevnoj ishrani" :class="[input, inputBorder('title'), 'text-base font-medium']">
          <p v-if="errors.title" class="mt-1 text-xs text-red-600">
            {{ errors.title }}
          </p>
        </div>

        <div>
          <label for="post-slug" :class="label">Adresa objave</label>
          <div class="flex rounded-md shadow-xs">
            <span class="inline-flex items-center rounded-l-md border border-r-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500">/blog/</span>
            <input
              id="post-slug"
              v-model="form.slug"
              type="text"
              maxlength="120"
              placeholder="kopriva-u-svakodnevnoj-ishrani"
              :class="[input, inputBorder('slug'), 'rounded-l-none shadow-none']"
              @input="slugTouched = true"
            >
          </div>
          <p v-if="errors.slug" class="mt-1 text-xs text-red-600">
            {{ errors.slug }}
          </p>
          <p v-else-if="post?.status === 'published'" class="mt-1 text-xs text-zinc-500">
            Promena adrese objavljene objave kvari postojeće linkove ka njoj.
          </p>
        </div>

        <div>
          <label for="post-description" :class="label">Kratak opis</label>
          <textarea
            id="post-description"
            v-model="form.description"
            rows="2"
            maxlength="300"
            placeholder="1–2 rečenice: prikazuje se ispod naslova, na kartici i na Google-u."
            :class="[input, inputBorder('description'), 'resize-y']"
          />
          <p class="mt-1 flex justify-between text-xs" :class="errors.description ? 'text-red-600' : 'text-zinc-500'">
            <span>{{ errors.description }}</span>
            <span>{{ form.description.length }}/300</span>
          </p>
        </div>

        <div>
          <div class="mb-1.5 flex items-center justify-between">
            <span :class="label" class="mb-0">Tekst</span>
            <div class="inline-flex rounded-md border border-zinc-300 bg-white p-0.5 text-xs font-medium" role="tablist">
              <button
                v-for="t in [{ id: 'edit', label: 'Uređivanje', icon: 'lucide:pencil' }, { id: 'preview', label: 'Pregled', icon: 'lucide:eye' }] as const"
                :key="t.id"
                type="button"
                role="tab"
                :aria-selected="tab === t.id"
                class="inline-flex items-center gap-1.5 rounded px-2.5 py-1"
                :class="tab === t.id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'"
                @click="tab = t.id"
              >
                <Icon :name="t.icon" class="size-3.5" />
                {{ t.label }}
              </button>
            </div>
          </div>
          <MarkdownEditor v-show="tab === 'edit'" v-model="form.body" :invalid="Boolean(errors.body)" />
          <div v-if="tab === 'preview'" class="rounded-lg border border-zinc-300 bg-pale-beige px-5 py-6">
            <MDC v-if="form.body.trim()" :value="form.body" tag="div" class="blog-prose" />
            <p v-else class="text-sm text-zinc-500">
              Još nema teksta.
            </p>
          </div>
          <p v-if="errors.body" class="mt-1 text-xs text-red-600">
            {{ errors.body }}
          </p>
        </div>
      </div>

      <!-- side column -->
      <div class="space-y-4">
        <section :class="card">
          <h2 class="font-sans text-sm font-semibold text-zinc-900">
            Objava
          </h2>
          <p class="mt-2 flex items-center gap-2 text-sm text-zinc-600">
            Status:
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="form.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'"
            >
              {{ form.status === 'published' ? 'Objavljeno' : 'Nacrt' }}
            </span>
          </p>
          <div class="mt-3">
            <label for="post-date" :class="label">Datum objave</label>
            <input id="post-date" v-model="form.publishedAt" type="date" :class="[input, inputBorder('publishedAt')]">
            <p class="mt-1 text-xs" :class="errors.publishedAt ? 'text-red-600' : 'text-zinc-500'">
              {{ errors.publishedAt || 'Prazno = danas, kada objavite.' }}
            </p>
          </div>
          <label class="mt-3 flex items-start gap-2.5 text-sm text-zinc-700">
            <input v-model="form.featured" type="checkbox" class="mt-0.5 size-4 rounded border-zinc-300 accent-zinc-900">
            <span>
              Istaknuta objava
              <span class="block text-xs text-zinc-500">Velika kartica na vrhu /blog. Samo jedna objava može biti istaknuta.</span>
            </span>
          </label>
          <div v-if="post && form.status === 'published'" class="mt-4 border-t border-zinc-100 pt-3">
            <button type="button" :disabled="pending" class="text-sm font-medium text-zinc-600 hover:text-zinc-900" @click="save('draft')">
              Povuci objavu (vrati u nacrt)
            </button>
          </div>
        </section>

        <section :class="card">
          <h2 class="font-sans text-sm font-semibold text-zinc-900">
            Naslovna slika
          </h2>
          <div class="mt-3 aspect-[17/10] overflow-hidden rounded-md border border-dashed border-zinc-300 bg-zinc-50">
            <img v-if="form.image" :src="form.image" :alt="form.imageAlt" class="size-full object-cover" referrerpolicy="no-referrer">
            <div v-else class="flex size-full items-center justify-center text-zinc-400">
              <Icon name="lucide:image" class="size-8" />
            </div>
          </div>
          <div class="mt-3">
            <label for="post-image" :class="label">Adresa slike</label>
            <input id="post-image" v-model="form.image" type="text" placeholder="/assets/blog/slika.jpg ili https://…" :class="[input, inputBorder('image')]">
            <p v-if="errors.image" class="mt-1 text-xs text-red-600">
              {{ errors.image }}
            </p>
          </div>
          <div class="mt-3">
            <label for="post-image-alt" :class="label">Opis slike</label>
            <input id="post-image-alt" v-model="form.imageAlt" type="text" maxlength="200" placeholder="Šta se vidi na slici" :class="[input, inputBorder('imageAlt')]">
            <p class="mt-1 text-xs text-zinc-500">
              Za slepe korisnike i Google.
            </p>
          </div>
        </section>

        <section :class="card">
          <h2 class="font-sans text-sm font-semibold text-zinc-900">
            Oznake
          </h2>
          <div class="mt-3 flex flex-wrap items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2 py-1.5 focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900">
            <span v-for="(tag, i) in form.tags" :key="tag" class="inline-flex items-center gap-1 rounded bg-zinc-100 py-0.5 pr-1 pl-2 text-xs text-zinc-700">
              {{ tag }}
              <button type="button" class="rounded p-0.5 text-zinc-400 hover:text-zinc-900" :aria-label="`Ukloni oznaku ${tag}`" @click="form.tags.splice(i, 1)">
                <Icon name="lucide:x" class="size-3" />
              </button>
            </span>
            <input
              v-model="tagInput"
              type="text"
              maxlength="30"
              :placeholder="form.tags.length ? '' : 'Ishrana, Med…'"
              aria-label="Nova oznaka"
              class="min-w-[80px] flex-1 border-0 bg-transparent py-0.5 text-sm focus:outline-none"
              @keydown="onTagKeydown"
              @blur="addTag"
            >
          </div>
          <p class="mt-1 text-xs" :class="errors.tags ? 'text-red-600' : 'text-zinc-500'">
            {{ errors.tags || 'Enter ili zarez dodaje oznaku. Prva se prikazuje na kartici.' }}
          </p>
        </section>

        <section :class="card">
          <h2 class="flex items-center justify-between font-sans text-sm font-semibold text-zinc-900">
            Preporučeni proizvodi
            <span class="text-xs font-normal text-zinc-500">{{ form.productIds.length }}/6</span>
          </h2>
          <ol v-if="form.productIds.length" class="mt-3 space-y-1">
            <li v-for="(id, i) in form.productIds" :key="id" class="flex items-center gap-2 rounded bg-zinc-50 px-2 py-1 text-sm">
              <span class="text-xs text-zinc-400">{{ i + 1 }}.</span>
              <span class="min-w-0 flex-1 truncate">{{ productName(id) }}</span>
              <button type="button" class="rounded p-0.5 text-zinc-400 hover:text-zinc-900" :aria-label="`Ukloni ${productName(id)}`" @click="toggleProduct(id)">
                <Icon name="lucide:x" class="size-3.5" />
              </button>
            </li>
          </ol>
          <input v-model="productSearch" type="search" placeholder="Pretraži proizvode…" aria-label="Pretraži proizvode" :class="[input, 'mt-3 border-zinc-300']">
          <ul class="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
            <li v-for="p in filteredProducts" :key="p.id">
              <label class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-zinc-50" :class="{ 'opacity-50': !form.productIds.includes(p.id) && form.productIds.length >= 6 }">
                <input
                  type="checkbox"
                  :checked="form.productIds.includes(p.id)"
                  :disabled="!form.productIds.includes(p.id) && form.productIds.length >= 6"
                  class="size-4 rounded border-zinc-300 accent-zinc-900"
                  @change="toggleProduct(p.id)"
                >
                <span class="min-w-0 flex-1 truncate">{{ p.name }}</span>
                <span v-if="!p.isActive" class="text-[10px] text-amber-600">neaktivan</span>
                <span class="text-xs text-zinc-400">{{ p.weight }}</span>
              </label>
            </li>
          </ul>
          <p v-if="errors.productIds" class="mt-1 text-xs text-red-600">
            {{ errors.productIds }}
          </p>
        </section>

        <section :class="card">
          <label for="post-author" class="font-sans text-sm font-semibold text-zinc-900">Autor</label>
          <input id="post-author" v-model="form.author" type="text" maxlength="80" :class="[input, inputBorder('author'), 'mt-3']">
          <p v-if="errors.author" class="mt-1 text-xs text-red-600">
            {{ errors.author }}
          </p>
        </section>
      </div>
    </div>
  </form>
</template>
