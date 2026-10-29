import { validateSlug } from './slug'

export interface ChecklistInput {
  title: string
  seoTitle: string | null
  description: string
  slug: string
  content: string
  tldr: string[]
  faq: unknown[]
  sources: unknown[]
  tags: string[]
  cover: { alt: string } | null
  wordCount: number
  hasTranslation: boolean
}

export interface ChecklistItem {
  id: string
  group: 'seo' | 'geo'
  label: string
  ok: boolean
  weight: number
}

function headingsInfo(markdown: string) {
  const headings = [...markdown.matchAll(/^(#{1,6})\s+.+$/gm)].map((m) => m[1]!.length)
  const h2 = headings.filter((d) => d === 2).length
  const hasH1 = headings.includes(1)
  let ordered = true
  let previous = 1
  for (const depth of headings) {
    if (depth > previous + 1) ordered = false
    previous = depth
  }
  return { h2, hasH1, ordered }
}

/** SEO + GEO readiness, shown in the editor sidebar and the posts list. */
export function postChecklist(input: ChecklistInput): { items: ChecklistItem[]; score: number } {
  const title = input.seoTitle || input.title
  const headings = headingsInfo(input.content)
  const hasInternalLink = /\]\((\/|https:\/\/mcanvar\.dev)/.test(input.content)

  const items: ChecklistItem[] = [
    {
      id: 'title',
      group: 'seo',
      label: 'Title is 20–60 characters',
      ok: title.length >= 20 && title.length <= 60,
      weight: 10,
    },
    {
      id: 'description',
      group: 'seo',
      label: 'Description is 70–160 characters',
      ok: input.description.length >= 70 && input.description.length <= 160,
      weight: 10,
    },
    {
      id: 'slug',
      group: 'seo',
      label: 'Clean, valid slug',
      ok: !validateSlug(input.slug),
      weight: 6,
    },
    {
      id: 'headings',
      group: 'seo',
      label: 'No H1 in body, headings in order',
      ok: !headings.hasH1 && headings.ordered,
      weight: 6,
    },
    {
      id: 'structure',
      group: 'seo',
      label: 'At least two H2 sections',
      ok: headings.h2 >= 2,
      weight: 6,
    },
    { id: 'length', group: 'seo', label: '300+ words', ok: input.wordCount >= 300, weight: 8 },
    {
      id: 'cover',
      group: 'seo',
      label: 'Cover image with alt text',
      ok: !!input.cover && input.cover.alt.length > 3,
      weight: 6,
    },
    {
      id: 'tags',
      group: 'seo',
      label: '1–5 tags',
      ok: input.tags.length >= 1 && input.tags.length <= 5,
      weight: 4,
    },
    {
      id: 'internal',
      group: 'seo',
      label: 'Links to another post',
      ok: hasInternalLink,
      weight: 4,
    },
    { id: 'tldr', group: 'geo', label: 'TL;DR at the top', ok: input.tldr.length > 0, weight: 12 },
    {
      id: 'questions',
      group: 'geo',
      label: 'A heading phrased as a question',
      ok: /^#{2,3}\s+.+\?\s*$/m.test(input.content),
      weight: 6,
    },
    {
      id: 'sources',
      group: 'geo',
      label: 'Cites at least one source',
      ok: input.sources.length > 0,
      weight: 10,
    },
    { id: 'faq', group: 'geo', label: 'Has an FAQ', ok: input.faq.length > 0, weight: 6 },
    {
      id: 'translation',
      group: 'geo',
      label: 'Has a translation',
      ok: input.hasTranslation,
      weight: 6,
    },
  ]

  const total = items.reduce((sum, item) => sum + item.weight, 0)
  const earned = items.reduce((sum, item) => sum + (item.ok ? item.weight : 0), 0)
  return { items, score: Math.round((earned / total) * 100) }
}
