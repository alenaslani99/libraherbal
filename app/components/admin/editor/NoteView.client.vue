<script setup lang="ts">
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const title = computed({
  get: () => String(props.node.attrs.title ?? ''),
  set: value => props.updateAttributes({ title: value }),
})
</script>

<!-- "Napomena" in the editor: looks like the box on the site, title editable in place -->
<template>
  <NodeViewWrapper as="aside" class="my-6 rounded-xl border border-sun/60 bg-forest px-5 py-4 text-white">
    <div class="flex items-center gap-2" contenteditable="false">
      <Icon name="lucide:info" class="size-4 shrink-0 text-sun" />
      <input
        v-model="title"
        type="text"
        maxlength="80"
        placeholder="Naslov napomene"
        aria-label="Naslov napomene"
        class="w-full bg-transparent text-sm font-semibold text-white placeholder:text-white/50 focus:outline-none"
      >
      <button
        type="button"
        class="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
        title="Ukloni napomenu"
        aria-label="Ukloni napomenu"
        @click="props.deleteNode()"
      >
        <Icon name="lucide:trash-2" class="size-3.5" />
      </button>
    </div>
    <NodeViewContent class="mt-1 text-sm font-light leading-5 text-white/85 [&_p+p]:mt-2" />
  </NodeViewWrapper>
</template>
