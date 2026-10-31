export const LOCALES = ['tr', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const POST_STATUSES = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'] as const
export type PostStatus = (typeof POST_STATUSES)[number]

export const COMMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'SPAM'] as const
export type CommentStatus = (typeof COMMENT_STATUSES)[number]

export interface PostCover {
  /** Site-relative media path, e.g. `/media/2026/abc-1200x630.webp`, or an absolute https URL. */
  key: string
  alt: string
  width?: number | null
  height?: number | null
}

export interface FaqItem {
  q: string
  a: string
}

export interface SourceLink {
  title: string
  url: string
}

/** Card-level fields: enough for lists, feeds, sitemap and search. */
export interface PostSummary {
  id: string
  translationKey: string
  locale: Locale
  slug: string
  title: string
  description: string
  tags: string[]
  cover: PostCover | null
  publishedAt: string
  updatedAt: string
  readingMinutes: number
}

export interface Post extends PostSummary {
  seoTitle: string | null
  tldr: string[]
  keyTakeaways: string[]
  content: string
  faq: FaqItem[]
  sources: SourceLink[]
  wordCount: number
  noindex: boolean
  canonicalUrl: string | null
  commentsEnabled: boolean
  createdAt: string
}

export interface AdminPost extends Omit<Post, 'publishedAt'> {
  status: PostStatus
  needsReview: boolean
  publishedAt: string | null
  legacyHtml: string | null
}

export interface PostRevision {
  id: string
  postId: string
  createdAt: string
  note: string | null
  snapshot: AdminPost
}

export interface PublicComment {
  id: string
  postId: string
  parentId: string | null
  authorName: string
  body: string
  createdAt: string
  isAuthorReply: boolean
}

export interface AdminComment extends PublicComment {
  status: CommentStatus
  recaptchaScore: number | null
  postSlug: string | null
  postLocale: Locale | null
  postTitle: string | null
}

export interface SiteSettings {
  authorName: string
  authorJobTitle: string
  bioTr: string
  bioEn: string
  avatarUrl: string
  sameAs: string[]
  knowsAbout: string[]
  commentsEnabled: boolean
  commentsAutoCloseDays: number | null
  recaptchaThreshold: number
  blockedCrawlers: string[]
}

export interface TocItem {
  id: string
  text: string
  depth: 2 | 3
}

export interface MediaItem {
  path: string
  url: string
  size: number | null
  lastModified: string | null
}
