import { yearOf } from './format'
import type { PostSummary } from './types'

export const PAGE_SIZE = 10
export const CHAPTER_SIZE = 5

export interface TrailItem extends PostSummary {
  href: string
}

export interface YearMarker {
  year: number
  count: number
  /** Index of the year's newest post in the full, newest-first list. */
  firstIndex: number
}

export interface TrailChapter {
  key: string
  year: number
  /** True for the first chapter of a year: render the year stone before it. */
  startsYear: boolean
  items: { item: TrailItem; index: number }[]
}

export function yearMarkers(posts: Pick<PostSummary, 'publishedAt'>[]): YearMarker[] {
  const markers: YearMarker[] = []
  posts.forEach((post, index) => {
    const year = yearOf(post.publishedAt)
    const last = markers[markers.length - 1]
    if (last && last.year === year) last.count += 1
    else markers.push({ year, count: 1, firstIndex: index })
  })
  return markers
}

/** Groups consecutive posts by year, then into chunks of five (one bento grid each). */
export function buildChapters(items: TrailItem[], offset: number): TrailChapter[] {
  const chapters: TrailChapter[] = []
  let current: TrailChapter | null = null
  items.forEach((item, i) => {
    const year = yearOf(item.publishedAt)
    if (!current || current.year !== year || current.items.length === CHAPTER_SIZE) {
      current = {
        key: `${year}-${offset + i}`,
        year,
        startsYear: !current || current.year !== year,
        items: [],
      }
      chapters.push(current)
    }
    current.items.push({ item, index: offset + i })
  })
  return chapters
}

/** The tall slot of each bento layout (gets the cover image on desktop). */
export function isTallSlot(count: number, position: number): boolean {
  return (
    (count === 5 && position === 2) ||
    (count === 4 && position === 1) ||
    (count === 3 && position === 0) ||
    count === 1
  )
}
