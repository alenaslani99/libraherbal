import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import NoteView from '~/components/admin/editor/NoteView.client.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    note: {
      insertNote: () => ReturnType
    }
  }
}

// MDC syntax the blog renders with app/components/content/Note.vue:
//   ::note{title="Napomena"}
//   Text, **bold**, more paragraphs…
//   ::
const NOTE_BLOCK = /^::note(?:\{([^}\n]*)\})?[ \t]*\n([\s\S]*?)\n::[ \t]*(?:\n|$)/

// "Napomena" box in the blog editor: dark green box with a title and paragraphs, saved as ::note
export const Note = Node.create({
  name: 'note',
  group: 'block',
  content: 'paragraph+',
  defining: true,

  addAttributes() {
    return {
      title: { default: 'Napomena' },
    }
  },

  parseHTML() {
    return [{ tag: 'aside[data-note]', getAttrs: el => ({ title: (el as HTMLElement).getAttribute('data-title') ?? '' }) }]
  },

  renderHTML({ HTMLAttributes, node }) {
    return ['aside', mergeAttributes(HTMLAttributes, { 'data-note': '', 'data-title': node.attrs.title }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(NoteView)
  },

  addCommands() {
    return {
      insertNote: () => ({ commands }) => commands.insertContent({
        type: this.name,
        attrs: { title: 'Napomena' },
        content: [{ type: 'paragraph' }],
      }),
    }
  },

  markdownTokenName: 'note',

  markdownTokenizer: {
    name: 'note',
    level: 'block',
    start: src => src.match(/^::note/m)?.index ?? -1,
    tokenize(src, _tokens, lexer) {
      const match = NOTE_BLOCK.exec(src)
      if (!match) return
      return {
        type: 'note',
        raw: match[0],
        title: /title="([^"]*)"/.exec(match[1] ?? '')?.[1] ?? '',
        tokens: lexer.blockTokens(match[2] ?? ''),
      }
    },
  },

  parseMarkdown(token, helpers) {
    return helpers.createNode('note', { title: token.title }, helpers.parseChildren(token.tokens ?? []))
  },

  renderMarkdown(node, helpers) {
    // a " would end the attribute early: swap it for a typographic quote
    const title = String(node.attrs?.title ?? '').replace(/"/g, '”').trim()
    return `::note${title ? `{title="${title}"}` : ''}\n${helpers.renderChildren(node.content ?? [], '\n\n')}\n::`
  },
})
