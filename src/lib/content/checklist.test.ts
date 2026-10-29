import { describe, expect, it } from 'vitest'
import { postChecklist } from './checklist'

const base = {
  title: 'A practical guide to Amplify Gen 2',
  seoTitle: null,
  description:
    'How I rebuilt my blog on Amplify Gen 2 with Next.js 16: data model, auth, comments and the trade-offs I hit along the way.',
  slug: 'amplify-gen-2-guide',
  content: '## Why?\n\nText\n\n## How does it work?\n\nSee [the other post](/other).',
  tldr: ['Short answer.'],
  faq: [{ q: 'q', a: 'a' }],
  sources: [{ title: 't', url: 'https://example.com' }],
  tags: ['aws'],
  cover: { alt: 'A trail in the woods' },
  wordCount: 800,
  hasTranslation: true,
}

describe('postChecklist', () => {
  it('scores a complete post at 100', () => {
    const { score, items } = postChecklist(base)
    expect(items.filter((i) => !i.ok).map((i) => i.id)).toEqual([])
    expect(score).toBe(100)
  })

  it('flags missing GEO elements', () => {
    const { items, score } = postChecklist({ ...base, tldr: [], sources: [], faq: [] })
    const failing = items.filter((i) => !i.ok).map((i) => i.id)
    expect(failing).toEqual(expect.arrayContaining(['tldr', 'sources', 'faq']))
    expect(score).toBeLessThan(80)
  })

  it('catches an H1 in the body and skipped heading levels', () => {
    const { items } = postChecklist({ ...base, content: '# Title\n\n#### Deep' })
    expect(items.find((i) => i.id === 'headings')?.ok).toBe(false)
  })
})
