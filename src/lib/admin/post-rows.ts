import { postChecklist } from '../content/checklist'
import { effectiveStatus } from '../data/mappers'
import type { AdminPost, Locale, PostStatus } from '../types'

export interface PostRow {
  id: string
  title: string
  slug: string
  locale: Locale
  status: PostStatus
  needsReview: boolean
  publishedAt: string | null
  updatedAt: string
  score: number
  tags: string[]
  translations: { locale: Locale; id: string | null }[]
}

export function toPostRows(posts: AdminPost[]): PostRow[] {
  return posts.map((post) => {
    const siblings = posts.filter(
      (p) => p.translationKey === post.translationKey && p.id !== post.id
    )
    const otherLocale: Locale = post.locale === 'tr' ? 'en' : 'tr'
    const translation = siblings.find((p) => p.locale === otherLocale)
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      locale: post.locale,
      status: effectiveStatus(post),
      needsReview: post.needsReview,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      tags: post.tags,
      score: postChecklist({ ...post, hasTranslation: !!translation }).score,
      translations: [
        { locale: post.locale, id: post.id },
        { locale: otherLocale, id: translation?.id ?? null },
      ].sort((a, b) => (a.locale === 'tr' ? -1 : b.locale === 'tr' ? 1 : 0)),
    }
  })
}
