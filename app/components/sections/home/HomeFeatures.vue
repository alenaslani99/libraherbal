<script setup lang="ts">
import { heroFeatures } from '~/data/home-mock'
</script>

<!--
  Figma "Specs Bar": hug 80px, padding 24/128, bg Main Green #2D3A1F, items spread with yellow dividers.
  Phones: stacked list · tablets: 3 centered columns · lg+: Figma row with dividers.
-->
<template>
  <section class="bg-forest text-white">
    <ul class="mx-auto grid max-w-[1440px] gap-5 px-4 py-6 sm:px-6 md:grid-cols-3 md:gap-6 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:px-16 xl:px-32">
      <template v-for="(item, i) in heroFeatures" :key="item.title">
        <li v-if="i > 0" class="hidden h-8 w-px bg-sun/70 lg:block" aria-hidden="true" />
        <li class="flex items-center gap-3 md:flex-col md:text-center lg:flex-row lg:gap-2 lg:text-left">
          <Icon :name="item.icon" class="size-7 shrink-0 text-sun" />
          <div>
            <p class="text-base font-semibold leading-5 lg:leading-4">
              {{ item.title }}
            </p>
            <p class="mt-0.5 text-xs font-light leading-4 lg:leading-3">
              {{ item.text }}
            </p>
          </div>
        </li>
      </template>
    </ul>
  </section>
</template>
