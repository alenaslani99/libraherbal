<script setup lang="ts">
const benefits = [
  { icon: 'lucide:zap', title: 'Brže poručivanje', text: 'Sačuvane adrese za dostavu' },
  { icon: 'lucide:package', title: 'Praćenje porudžbina', text: 'Pregled svih porudžbina i statusa' },
  { icon: 'lucide:tag', title: 'Posebne ponude', text: 'Popusti i saveti samo za članove' },
]
</script>

<!-- Dark green side card, styled after the Figma "Vaša korpa" summary card -->
<template>
  <aside class="rounded-xl bg-forest p-6 text-white sm:p-7">
    <p class="text-xs font-semibold uppercase tracking-wide">
      Zašto napraviti nalog?
    </p>
    <div class="mt-4 h-1 rounded-full bg-sun" />

    <ul class="mt-6 space-y-5">
      <li v-for="item in benefits" :key="item.title" class="flex items-start gap-3">
        <Icon :name="item.icon" class="mt-0.5 size-5 shrink-0 text-sun" />
        <div class="leading-tight">
          <p class="text-sm font-semibold">
            {{ item.title }}
          </p>
          <p class="mt-0.5 text-xs font-light text-white/75">
            {{ item.text }}
          </p>
        </div>
      </li>
    </ul>

    <div class="mt-6 flex items-start gap-3 border-t border-white/30 pt-5">
      <Icon name="lucide:hand-coins" class="mt-0.5 size-5 shrink-0 text-sun" />
      <div class="leading-tight">
        <p class="text-sm font-semibold">
          Plaćanje pouzećem
        </p>
        <p class="mt-0.5 text-xs font-light text-white/75">
          Bez kartice — platite kuriru prilikom preuzimanja.
        </p>
      </div>
    </div>
  </aside>
</template>
