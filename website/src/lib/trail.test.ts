import { describe, expect, it } from 'vitest'
import { fold, searchPosts } from './search'
import { buildChapters, isTallSlot, yearMarkers, type TrailItem } from './trail'

function item(id: string, publishedAt: string): TrailItem {
  return {
    id,
    translationKey: id,
    locale: 'tr',
    slug: id,
    title: id,
    description: '',
    tags: [],
    cover: null,
    publishedAt,
    updatedAt: publishedAt,
    readingMinutes: 1,
    href: `/${id}`,
  }
}

const items = [
  ...Array.from({ length: 7 }, (_, i) => item(`a${i}`, `2026-0${9 - i}-01T10:00:00.000Z`)),
  item('b0', '2025-06-01T10:00:00.000Z'),
]

describe('trail chapters', () => {
  it('splits by year and into bento chunks of five', () => {
    const chapters = buildChapters(items, 0)
    expect(chapters.map((c) => [c.year, c.items.length, c.startsYear])).toEqual([
      [2026, 5, true],
      [2026, 2, false],
      [2025, 1, true],
    ])
    expect(chapters[2]!.items[0]!.index).toBe(7)
  })

  it('keeps global indexes when a page starts later', () => {
    expect(buildChapters(items.slice(0, 2), 10)[0]!.items.map((i) => i.index)).toEqual([10, 11])
  })

  it('marks year markers with their first index', () => {
    expect(yearMarkers(items)).toEqual([
      { year: 2026, count: 7, firstIndex: 0 },
      { year: 2025, count: 1, firstIndex: 7 },
    ])
  })

  it('knows the tall slot of each layout', () => {
    expect(isTallSlot(5, 2)).toBe(true)
    expect(isTallSlot(5, 0)).toBe(false)
    expect(isTallSlot(3, 0)).toBe(true)
  })
})

describe('search', () => {
  it('folds Turkish characters and case', () => {
    expect(fold('İSTANBUL Çağrı')).toBe('istanbul cagri')
  })

  it('ranks title matches first', () => {
    const entries = [
      {
        title: 'Kamp',
        description: 'dynamodb notları',
        tags: [],
        year: 2025,
        path: '/kamp',
        minutes: 3,
      },
      {
        title: 'DynamoDB taşıma',
        description: '',
        tags: [],
        year: 2026,
        path: '/dynamo',
        minutes: 9,
      },
    ]
    expect(searchPosts(entries, 'dynamo').map((e) => e.path)).toEqual(['/dynamo', '/kamp'])
  })
})
