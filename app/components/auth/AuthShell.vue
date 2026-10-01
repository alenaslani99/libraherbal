<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  titleItalic: string
}>()
</script>

<!--
  Auth page layout, after the Figma checkout form: eyebrow + two-line Fraunces heading
  (second line italic), form on the left (643px at 1440), dark green card on the right (448px), gap 96.
-->
<template>
  <section class="bg-pale-beige">
    <div class="mx-auto max-w-[1440px] px-4 pt-12 pb-16 sm:px-6 lg:px-16 lg:pt-[72px] lg:pb-24 xl:px-32">
      <p class="text-xs uppercase leading-none text-brown-200">
        {{ eyebrow }}
      </p>
      <h1 class="mt-3.5 text-[44px] leading-none tracking-[-0.02em] text-ink sm:text-[56px]">
        {{ title }}<br>
        <em>{{ titleItalic }}</em>
      </h1>

      <div class="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,643px)_minmax(300px,448px)] lg:justify-between lg:gap-16">
        <div>
          <slot />
        </div>
        <div class="lg:sticky lg:top-24 lg:self-start">
          <AuthBenefits />
        </div>
      </div>
    </div>
  </section>
</template>
