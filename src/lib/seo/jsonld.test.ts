import { describe, expect, it } from 'vitest'
import { defaultSettings } from '../site'
import type { Post } from '../types'
import {
  blogPostingNode,
  breadcrumbNode,
  faqNode,
  graph,
  PERSON_ID,
  serializeJsonLd,
} from './jsonld'

const post: Post = {
  id: 'p1',
  translationKey: 'k',
  locale: 'tr',
  slug: 'merhaba',
  title: 'Merhaba',
  description: 'Açıklama',
  tags: ['aws'],
  cover: null,
  publishedAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  readingMinutes: 4,
  seoTitle: null,
  tldr: ['Kısa'],
  keyTakeaways: [],
  content: '',
  faq: [{ q: 'Soru?', a: 'Cevap.' }],
  sources: [{ title: 'Kaynak', url: 'https://example.com' }],
  wordCount: 800,
  noindex: false,
  canonicalUrl: null,
  commentsEnabled: true,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('JSON-LD', () => {
  it('builds a BlogPosting linked to the site author and its translation', () => {
    const node = blogPostingNode({
      post,
      imageUrl: 'https://mcanvar.dev/merhaba/opengraph-image',
      translations: [{ ...post, id: 'p2', locale: 'en', slug: 'hello' }],
      comments: [],
    }) as unknown as Record<string, unknown>
    expect(node['@type']).toBe('BlogPosting')
    expect(node.author).toEqual({ '@id': PERSON_ID })
    expect(node.inLanguage).toBe('tr-TR')
    expect(node.datePublished).toBe(post.publishedAt)
    expect(node.dateModified).toBe(post.updatedAt)
    expect(node.url).toBe('https://mcanvar.dev/merhaba')
    expect(node.workTranslation).toEqual([
      {
        '@type': 'BlogPosting',
        '@id': 'https://mcanvar.dev/en/hello#article',
        inLanguage: 'en-US',
      },
    ])
  })

  it('emits FAQPage only when there is an FAQ', () => {
    expect(faqNode(post)).not.toBeNull()
    expect(faqNode({ ...post, faq: [] })).toBeNull()
  })

  it('builds breadcrumbs with absolute URLs', () => {
    const node = breadcrumbNode([
      { name: 'Patika', path: '/' },
      { name: 'Merhaba', path: '/merhaba' },
    ]) as unknown as { itemListElement: { item: string; position: number }[] }
    expect(node.itemListElement.map((i) => i.item)).toEqual([
      'https://mcanvar.dev/',
      'https://mcanvar.dev/merhaba',
    ])
  })

  it('escapes < so content cannot close the script tag', () => {
    const json = serializeJsonLd(
      graph({ '@type': 'Thing', name: '</script><script>alert(1)</script>' })
    )
    expect(json).not.toContain('</script>')
    expect(json).toContain('\\u003c/script>')
  })

  it('has sensible default settings', () => {
    expect(defaultSettings.authorName).toBe('Mevlüt Canvar')
  })
})
