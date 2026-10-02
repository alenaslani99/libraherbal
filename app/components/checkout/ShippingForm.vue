<script setup lang="ts">
import type { ShippingDetails } from '#shared/types/order'

defineProps<{ errors: Partial<Record<keyof ShippingDetails, string>> }>()

const form = defineModel<ShippingDetails>({ required: true })
</script>

<!--
  Figma "Podaci za dostavu" on a 10-column grid: halves = 5+5, Email full width,
  Adresa 70% + Poštanski broj 30%, Napomena full-width textarea.
  Row gap is small because every field reserves a line for its validation message.
-->
<template>
  <fieldset>
    <legend class="font-heading text-2xl font-semibold leading-tight text-ink">
      Podaci za dostavu
    </legend>
    <div class="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-10">
      <FormField v-model="form.firstName" label="Ime" placeholder="Vaše ime" autocomplete="given-name" required :error="errors.firstName" class="sm:col-span-5" />
      <FormField v-model="form.lastName" label="Prezime" placeholder="Vaše prezime" autocomplete="family-name" required :error="errors.lastName" class="sm:col-span-5" />
      <FormField
        v-model="form.email"
        label="Email adresa"
        type="email"
        placeholder="ime@email.com"
        autocomplete="email"
        required
        :error="errors.email"
        class="sm:col-span-10"
      />
      <FormField v-model="form.phone" label="Telefon" type="tel" placeholder="+381 6X XXX XXXX" autocomplete="tel" required :error="errors.phone" class="sm:col-span-5" />
      <FormField v-model="form.city" label="Grad" placeholder="Beograd, Novi Sad, Niš…" autocomplete="address-level2" required :error="errors.city" class="sm:col-span-5" />
      <FormField
        v-model="form.address"
        label="Adresa za dostavu"
        placeholder="Ulica i broj, sprat, stan"
        autocomplete="street-address"
        required
        :error="errors.address"
        class="sm:col-span-7"
      />
      <FormField
        v-model="form.postalCode"
        label="Poštanski broj"
        placeholder="11000"
        autocomplete="postal-code"
        inputmode="numeric"
        required
        :error="errors.postalCode"
        class="sm:col-span-3"
      />
      <FormTextarea
        v-model="form.note"
        label="Napomena (opciono)"
        placeholder="Npr. pozvati pre dostave, ulaz iz dvorišta…"
        :maxlength="500"
        class="sm:col-span-10"
      />
    </div>
  </fieldset>
</template>
