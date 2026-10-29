// @vitest-environment jsdom
import { Editor } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { describe, expect, it } from 'vitest'

function roundTrip(markdown: string): string {
  const editor = new Editor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, underline: false }),
      Image,
      TableKit,
      Markdown,
    ],
    content: markdown,
    contentType: 'markdown',
  })
  const result = editor.getMarkdown()
  editor.destroy()
  return result
}

describe('editor Markdown round-trip', () => {
  it('keeps headings, emphasis, links, lists, code and images', () => {
    const source = [
      '## Neden bölge değiştirdim?',
      '',
      'Metin **kalın** ve *italik*, bir [bağlantı](https://example.com).',
      '',
      '- bir',
      '- iki',
      '',
      '```ts',
      'const a = 1',
      '```',
      '',
      '![Patika](/media/2026/trail-ab12cd-1200x630.webp)',
    ].join('\n')
    const out = roundTrip(source)
    expect(out).toContain('## Neden bölge değiştirdim?')
    expect(out).toContain('**kalın**')
    expect(out).toMatch(/[*_]italik[*_]/)
    expect(out).toContain('[bağlantı](https://example.com)')
    expect(out).toMatch(/[-*] bir/)
    expect(out).toContain('```ts')
    expect(out).toContain('const a = 1')
    expect(out).toContain('![Patika](/media/2026/trail-ab12cd-1200x630.webp)')
  })

  it('keeps GFM tables', () => {
    const out = roundTrip('| a | b |\n| --- | --- |\n| 1 | 2 |')
    expect(out).toMatch(/\|\s*a\s*\|\s*b\s*\|/)
    expect(out).toMatch(/\|\s*1\s*\|\s*2\s*\|/)
  })
})
