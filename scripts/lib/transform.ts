import { gfm } from '@joplin/turndown-plugin-gfm'
import TurndownService from 'turndown'
import { slugify, validateSlug } from '../../src/lib/content/slug'
import { contentStats, excerpt, markdownToPlainText } from '../../src/lib/content/stats'

/** Shape of the Amplify Gen 1 items found in the Paris tables. */
export interface Gen1Post {
  id: string
  __typename?: string
  language?: string
  title?: string
  slug?: string
  description?: string
  content?: string
  createdAt?: string
  updatedAt?: string
  owner?: string
  [key: string]: unknown
}

export interface Gen1Comment {
  id: string
  postCommentsId?: string
  postId?: string
  content?: string
  createdAt?: string
  updatedAt?: string
  owner?: string
  [key: string]: unknown
}

export interface MigrationWarning {
  id: string
  message: string
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
  hr: '---',
})
turndown.use(gfm)
// The page already has the H1; demote any H1 inside old content.
turndown.addRule('demoteH1', {
  filter: 'h1',
  replacement: (content) => `\n\n## ${content.trim()}\n\n`,
})
turndown.remove(['script', 'style', 'iframe', 'object', 'embed'])

export function htmlToMarkdown(html: string): string {
  return turndown
    .turndown(html)
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function externalImages(html: string): string[] {
  return [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)]
    .map((m) => m[1]!)
    .filter((src) => /^https?:\/\//.test(src))
}

export function transformPost(
  item: Gen1Post,
  translations: Record<string, string>,
  warnings: MigrationWarning[]
): Record<string, unknown> {
  const locale = item.language === 'en' ? 'en' : 'tr'
  const html = item.content ?? ''
  const content = htmlToMarkdown(html)
  const stats = contentStats(content)
  const createdAt = item.createdAt ?? new Date().toISOString()
  const updatedAt = item.updatedAt ?? createdAt

  let slug = (item.slug ?? '').trim()
  if (validateSlug(slug)) {
    const fixed = slugify(slug || item.title || item.id)
    warnings.push({
      id: item.id,
      message: `slug "${slug}" is not URL-safe; using "${fixed}" (add a redirect from the old URL)`,
    })
    slug = fixed
  }
  for (const src of externalImages(html)) {
    warnings.push({ id: item.id, message: `external image kept as-is: ${src}` })
  }

  const description = (item.description ?? '').trim() || excerpt(markdownToPlainText(content), 160)

  return {
    id: item.id,
    __typename: 'Post',
    translationKey: translations[`${locale}:${slug}`] ?? translations[item.id] ?? item.id,
    locale,
    slug,
    title: (item.title ?? slug).trim(),
    seoTitle: null,
    description,
    tldr: [],
    keyTakeaways: [],
    content,
    legacyHtml: html,
    status: 'PUBLISHED',
    needsReview: true,
    publishedAt: createdAt,
    tags: [],
    cover: null,
    faq: [],
    sources: [],
    readingMinutes: stats.readingMinutes,
    wordCount: stats.wordCount,
    noindex: false,
    canonicalUrl: null,
    commentsEnabled: true,
    createdAt,
    updatedAt,
  }
}

export function transformComment(
  item: Gen1Comment,
  postsById: Map<string, Record<string, unknown>>,
  warnings: MigrationWarning[]
): Record<string, unknown> | null {
  const postId = item.postCommentsId ?? item.postId
  const post = postId ? postsById.get(postId) : undefined
  if (!post) {
    warnings.push({ id: item.id, message: `comment skipped: post ${postId ?? '(none)'} not found` })
    return null
  }
  const createdAt = item.createdAt ?? new Date().toISOString()
  return {
    id: item.id,
    __typename: 'Comment',
    postId: post.id,
    postSlug: post.slug,
    postLocale: post.locale,
    postTitle: post.title,
    parentId: null,
    authorName: post.locale === 'en' ? 'Reader' : 'Okur',
    body: String(item.content ?? '').trim(),
    // Every old comment goes through moderation again.
    status: 'PENDING',
    isAuthorReply: false,
    recaptchaScore: null,
    ipHash: null,
    moderatedAt: null,
    expiresAt: null,
    createdAt,
    updatedAt: item.updatedAt ?? createdAt,
  }
}
