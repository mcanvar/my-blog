import { postPath } from './seo/urls'
import type { TrailItem } from './trail'
import type { PostSummary } from './types'

export function toTrailItems(posts: PostSummary[]): TrailItem[] {
  return posts.map((post) => ({ ...post, href: postPath(post.locale, post.slug) }))
}
