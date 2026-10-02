<template>
  <div class="flex flex-col items-center gap-4 rounded-3xl bg-main-beige/50 px-6 py-16 text-center">
    <Icon name="lucide:shopping-cart" class="size-10 text-brown-200" />
    <p class="font-heading text-2xl font-semibold text-ink">
      Vaša korpa je prazna
    </p>
    <p class="max-w-[320px] text-sm text-ink">
      Pogledajte naše medove, čajeve i meleme i pronađite svoj dobar ritual.
    </p>
    <BaseButton to="/proizvodi" size="lg" class="mt-2 font-medium">
      Istražite proizvode
      <Icon name="lucide:arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-1" />
    </BaseButton>
  </div>
</template>
