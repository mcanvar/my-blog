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
  // A <pre> holding only unescaped markup has no visible text, so turndown would treat it as blank.
  blankReplacement: (_content, node) => {
    const el = node as unknown as HTMLElement
    if (el.nodeName === 'PRE' && el.children.length > 0) return preToMarkdown(el)
    return (node as { isBlock?: boolean }).isBlock ? '\n\n' : ''
  },
})
turndown.use(gfm)
// The page already has the H1; demote any H1 inside old content.
turndown.addRule('demoteH1', {
  filter: 'h1',
  replacement: (content) => `\n\n## ${content.trim()}\n\n`,
})
turndown.remove(['script', 'style', 'iframe', 'object', 'embed'])

const INLINE_CODE_TAGS = new Set(['SPAN', 'BR', 'B', 'STRONG', 'I', 'EM', 'A', 'CODE'])

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&amp;/g, '&')
}

/**
 * Code blocks. Highlighter spans are flattened to text; raw markup pasted unescaped into a <pre>
 * (e.g. XML config) was parsed as elements by the browser, so it is serialized back as text.
 */
function preToMarkdown(pre: HTMLElement): string {
  const code = pre.querySelector('code')
  const target = code ?? pre
  const language = /language-([\w+-]+)/.exec(code?.getAttribute('class') ?? '')?.[1] ?? ''
  const hasMarkup = Array.from(target.querySelectorAll('*')).some(
    (el) => !INLINE_CODE_TAGS.has(el.nodeName)
  )
  const raw = hasMarkup
    ? decodeEntities(
        target.innerHTML
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/?(span|b|strong|i|em|a|code)(\s[^>]*)?>/gi, '')
      )
    : (target.textContent ?? '')
  const text = raw.replace(/^\n+/, '').replace(/\s+$/, '')
  const fence = text.includes('```') ? '~~~' : '```'
  return `\n\n${fence}${language}\n${text}\n${fence}\n\n`
}

turndown.addRule('preformatted', {
  filter: 'pre',
  replacement: (_content, node) => preToMarkdown(node as HTMLElement),
})

/** Escape <pre> blocks (without <code>) that contain raw, non-formatting tags, so they survive parsing verbatim. */
function escapeRawMarkupInPre(html: string): string {
  return html.replace(
    /<pre(\s[^>]*)?>([\s\S]*?)<\/pre>/gi,
    (block, attrs: string | undefined, inner: string) => {
      if (/<code[\s>]/i.test(inner)) return block
      const hasRawTags = /<(?!\/?(?:span|br|b|strong|i|em|a)\b)\/?[a-z][^>]*>/i.test(inner)
      if (!hasRawTags) return block
      return `<pre${attrs ?? ''}>${inner.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`
    }
  )
}

export function htmlToMarkdown(html: string): string {
  return (
    turndown
      .turndown(escapeRawMarkupInPre(html))
      // Old tables had no <th>: promote the first row when the generated header row is empty.
      .replace(
        /^\|(?:[ \t]*\|)+\n(\|(?:[ \t]*:?-+:?[ \t]*\|)+)\n(\|.*\|)$/gm,
        (_m, separator: string, first: string) => `${first}\n${separator}`
      )
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
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

  // Some old items carry the summary in a misspelled `descripton` attribute.
  const oldDescription =
    item.description ?? (typeof item.descripton === 'string' ? item.descripton : '')
  const description = oldDescription.trim() || excerpt(markdownToPlainText(content), 160)

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
