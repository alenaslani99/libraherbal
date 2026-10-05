<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<!-- Blog block: ::note{title="…"} text :: — dark green box with a thin honey border -->
<template>
  <aside class="my-8rounded-xl border border-sun/60 bg-forest px-5 py-4 text-white">
    <p v-if="title" class="text-sm font-semibold leading-5">
      {{ title }}
    </p>
    <div class="mt-1 text-sm font-light leading-5 text-white/85 [&_p]:m-0">
      <slot mdc-unwrap="p" />
    </div>
  </aside>
</template>
