import { defaultSettings } from '../site'
import {
  COMMENT_STATUSES,
  LOCALES,
  POST_STATUSES,
  type AdminComment,
  type AdminPost,
  type CommentStatus,
  type FaqItem,
  type Locale,
  type Post,
  type PostCover,
  type PostStatus,
  type PostSummary,
  type PublicComment,
  type SiteSettings,
  type SourceLink,
} from '../types'

type Maybe<T> = T | null | undefined
type Loose = Record<string, unknown>

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
const nstr = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null)
const num = (v: unknown, fallback = 0): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback)
const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.length > 0) : []

export function toLocale(v: unknown): Locale {
  return (LOCALES as readonly string[]).includes(v as string) ? (v as Locale) : 'tr'
}

function toStatus(v: unknown): PostStatus {
  return (POST_STATUSES as readonly string[]).includes(v as string) ? (v as PostStatus) : 'DRAFT'
}

function toCommentStatus(v: unknown): CommentStatus {
  return (COMMENT_STATUSES as readonly string[]).includes(v as string)
    ? (v as CommentStatus)
    : 'PENDING'
}

function toCover(v: unknown): PostCover | null {
  if (!v || typeof v !== 'object') return null
  const c = v as Loose
  if (typeof c.key !== 'string' || !c.key) return null
  return {
    key: c.key,
    alt: str(c.alt),
    width: typeof c.width === 'number' ? c.width : null,
    height: typeof c.height === 'number' ? c.height : null,
  }
}

function toFaq(v: unknown): FaqItem[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((x): x is Loose => !!x && typeof x === 'object')
    .map((x) => ({ q: str(x.q), a: str(x.a) }))
    .filter((x) => x.q && x.a)
}

function toSources(v: unknown): SourceLink[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((x): x is Loose => !!x && typeof x === 'object')
    .map((x) => ({ title: str(x.title), url: str(x.url) }))
    .filter((x) => x.title && x.url)
}

export function toSummary(raw: Maybe<Loose>): PostSummary | null {
  if (!raw || typeof raw.id !== 'string' || typeof raw.slug !== 'string') return null
  return {
    id: raw.id,
    translationKey: str(raw.translationKey, raw.id),
    locale: toLocale(raw.locale),
    slug: raw.slug,
    title: str(raw.title),
    description: str(raw.description),
    tags: strings(raw.tags),
    cover: toCover(raw.cover),
    publishedAt: str(raw.publishedAt, str(raw.createdAt)),
    updatedAt: str(raw.updatedAt, str(raw.publishedAt)),
    readingMinutes: Math.max(1, num(raw.readingMinutes, 1)),
  }
}

export function toPost(raw: Maybe<Loose>): Post | null {
  const summary = toSummary(raw)
  if (!summary || !raw) return null
  return {
    ...summary,
    seoTitle: nstr(raw.seoTitle),
    tldr: strings(raw.tldr),
    keyTakeaways: strings(raw.keyTakeaways),
    content: str(raw.content),
    faq: toFaq(raw.faq),
    sources: toSources(raw.sources),
    wordCount: num(raw.wordCount),
    noindex: bool(raw.noindex, false),
    canonicalUrl: nstr(raw.canonicalUrl),
    commentsEnabled: bool(raw.commentsEnabled, true),
    createdAt: str(raw.createdAt, summary.publishedAt),
  }
}

export function toAdminPost(raw: Maybe<Loose>): AdminPost | null {
  const post = toPost(raw)
  if (!post || !raw) return null
  return {
    ...post,
    status: toStatus(raw.status),
    needsReview: bool(raw.needsReview, false),
    publishedAt: nstr(raw.publishedAt),
    legacyHtml: nstr(raw.legacyHtml),
  }
}

export function toPublicComment(raw: Maybe<Loose>): PublicComment | null {
  if (!raw || typeof raw.id !== 'string') return null
  return {
    id: raw.id,
    postId: str(raw.postId),
    parentId: nstr(raw.parentId),
    authorName: str(raw.authorName),
    body: str(raw.body),
    createdAt: str(raw.createdAt),
    isAuthorReply: bool(raw.isAuthorReply, false),
  }
}

export function toAdminComment(raw: Maybe<Loose>): AdminComment | null {
  const comment = toPublicComment(raw)
  if (!comment || !raw) return null
  return {
    ...comment,
    status: toCommentStatus(raw.status),
    recaptchaScore: typeof raw.recaptchaScore === 'number' ? raw.recaptchaScore : null,
    postSlug: nstr(raw.postSlug),
    postLocale: raw.postLocale ? toLocale(raw.postLocale) : null,
    postTitle: nstr(raw.postTitle),
  }
}

export function toSettings(raw: Maybe<Loose>): SiteSettings {
  if (!raw) return defaultSettings
  return {
    authorName: str(raw.authorName, defaultSettings.authorName),
    authorJobTitle: str(raw.authorJobTitle, defaultSettings.authorJobTitle),
    bioTr: str(raw.bioTr, defaultSettings.bioTr),
    bioEn: str(raw.bioEn, defaultSettings.bioEn),
    avatarUrl: str(raw.avatarUrl, defaultSettings.avatarUrl),
    sameAs: strings(raw.sameAs),
    knowsAbout: raw.knowsAbout ? strings(raw.knowsAbout) : defaultSettings.knowsAbout,
    commentsEnabled: bool(raw.commentsEnabled, true),
    commentsAutoCloseDays:
      typeof raw.commentsAutoCloseDays === 'number' ? raw.commentsAutoCloseDays : null,
    recaptchaThreshold: num(raw.recaptchaThreshold, defaultSettings.recaptchaThreshold),
    blockedCrawlers: strings(raw.blockedCrawlers),
  }
}

/** Strip an admin post down to what visitors may see. */
export function adminToPublic(post: AdminPost): Post {
  const { status: _s, needsReview: _n, legacyHtml: _l, publishedAt, ...rest } = post
  return { ...rest, publishedAt: publishedAt ?? post.createdAt }
}

/** Visible to visitors: PUBLISHED or SCHEDULED, once publishedAt has passed. */
export function isLive(post: Pick<AdminPost, 'status' | 'publishedAt'>, now = new Date()): boolean {
  return (
    (post.status === 'PUBLISHED' || post.status === 'SCHEDULED') &&
    !!post.publishedAt &&
    new Date(post.publishedAt) <= now
  )
}

/** What the admin should see: a SCHEDULED post whose time passed is effectively PUBLISHED. */
export function effectiveStatus(post: Pick<AdminPost, 'status' | 'publishedAt'>, now = new Date()) {
  if (post.status === 'SCHEDULED' && isLive(post, now)) return 'PUBLISHED' as const
  return post.status
}
