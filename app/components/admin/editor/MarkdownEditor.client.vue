<script setup lang="ts">
import Image from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { Note } from '~/editor/note'

// v-model is Markdown: what blog_posts.body stores and the blog renders with <MDC>
const model = defineModel<string>({ required: true })
defineProps<{ invalid?: boolean }>()

const editor = useEditor({
  content: model.value,
  contentType: 'markdown',
  extensions: [
    StarterKit.configure({
      // h1 is the post title, so the body starts at h2
      heading: { levels: [2, 3] },
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      // no blog styles for these, and underline has no Markdown syntax
      code: false,
      codeBlock: false,
      strike: false,
      underline: false,
    }),
    Image,
    Note,
    Markdown,
    Placeholder.configure({ placeholder: 'Počnite da pišete…' }),
  ],
  editorProps: {
    // same styles as the post on the site (.blog-prose in main.css)
    attributes: { class: 'blog-prose min-h-[420px] px-5 py-4 focus:outline-none' },
  },
  onUpdate: ({ editor }) => {
    model.value = editor.getMarkdown()
  },
})

// a value set from outside (post loaded after the editor started) replaces the content
watch(model, (value) => {
  const e = editor.value
  if (e && value !== e.getMarkdown()) e.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })
})

function setLink() {
  const e = editor.value
  if (!e) return
  const current = e.getAttributes('link').href as string | undefined
  const href = window.prompt('Adresa linka (prazno = ukloni link)', current ?? 'https://')
  if (href === null) return
  if (!href.trim() || href.trim() === 'https://') {
    e.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  e.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run()
}

function addImage() {
  const e = editor.value
  if (!e) return
  const src = window.prompt('Adresa slike (/assets/blog/slika.jpg ili https://…)')?.trim()
  if (!src) return
  if (!src.startsWith('/') && !src.startsWith('https://')) {
    window.alert('Adresa slike mora počinjati sa / ili https://')
    return
  }
  const alt = window.prompt('Kratak opis slike (za slepe korisnike i Google)')?.trim() ?? ''
  e.chain().focus().setImage({ src, alt }).run()
}

interface Tool {
  label: string
  icon: string
  run: () => void
  active?: () => boolean
  disabled?: () => boolean
}

const tools = computed<Tool[][]>(() => {
  const e = editor.value
  if (!e) return []
  return [
    [
      { label: 'Naslov', icon: 'lucide:heading-2', run: () => e.chain().focus().toggleHeading({ level: 2 }).run(), active: () => e.isActive('heading', { level: 2 }) },
      { label: 'Podnaslov', icon: 'lucide:heading-3', run: () => e.chain().focus().toggleHeading({ level: 3 }).run(), active: () => e.isActive('heading', { level: 3 }) },
    ],
    [
      { label: 'Podebljano (Ctrl+B)', icon: 'lucide:bold', run: () => e.chain().focus().toggleBold().run(), active: () => e.isActive('bold') },
      { label: 'Kurziv (Ctrl+I)', icon: 'lucide:italic', run: () => e.chain().focus().toggleItalic().run(), active: () => e.isActive('italic') },
      { label: 'Link', icon: 'lucide:link', run: setLink, active: () => e.isActive('link') },
    ],
    [
      { label: 'Lista', icon: 'lucide:list', run: () => e.chain().focus().toggleBulletList().run(), active: () => e.isActive('bulletList') },
      { label: 'Numerisana lista', icon: 'lucide:list-ordered', run: () => e.chain().focus().toggleOrderedList().run(), active: () => e.isActive('orderedList') },
      { label: 'Citat', icon: 'lucide:quote', run: () => e.chain().focus().toggleBlockquote().run(), active: () => e.isActive('blockquote') },
      { label: 'Napomena (zeleni okvir)', icon: 'lucide:message-square-warning', run: () => e.chain().focus().insertNote().run(), active: () => e.isActive('note') },
    ],
    [
      { label: 'Slika', icon: 'lucide:image', run: addImage },
      { label: 'Linija', icon: 'lucide:minus', run: () => e.chain().focus().setHorizontalRule().run() },
    ],
    [
      { label: 'Poništi (Ctrl+Z)', icon: 'lucide:undo-2', run: () => e.chain().focus().undo().run(), disabled: () => !e.can().undo() },
      { label: 'Ponovi (Ctrl+Y)', icon: 'lucide:redo-2', run: () => e.chain().focus().redo().run(), disabled: () => !e.can().redo() },
    ],
  ]
})
</script>

<template>
  <div class="overflow-hidden rounded-lg border bg-pale-beige" :class="invalid ? 'border-red-500' : 'border-zinc-300'">
    <div class="sticky top-14 z-10 flex flex-wrap items-center gap-1 border-b border-zinc-200 bg-white px-2 py-1.5 lg:top-0" role="toolbar" aria-label="Alati za tekst">
      <template v-for="(group, i) in tools" :key="i">
        <span v-if="i > 0" class="mx-1 h-5 w-px bg-zinc-200" aria-hidden="true" />
        <button
          v-for="tool in group"
          :key="tool.label"
          type="button"
          :title="tool.label"
          :aria-label="tool.label"
          :aria-pressed="tool.active ? tool.active() : undefined"
          :disabled="tool.disabled?.()"
          class="rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-35"
          :class="{ 'bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white': tool.active?.() }"
          @mousedown.prevent
          @click="tool.run"
        >
          <Icon :name="tool.icon" class="size-4" />
        </button>
      </template>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
/* Placeholder text on an empty editor (TipTap Placeholder extension) */
.blog-prose p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: var(--color-brown-200);
}
</style>
