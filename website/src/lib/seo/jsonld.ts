import type {
  BlogPosting,
  BreadcrumbList,
  CollectionPage,
  Comment,
  FAQPage,
  Graph,
  Person,
  ProfilePage,
  Thing,
  WebSite,
  Blog,
} from 'schema-dts'
import { absoluteUrl, site, siteUrl } from '../site'
import type { Locale, Post, PostSummary, PublicComment, SiteSettings } from '../types'
import { homePath, postPath, staticPath } from './urls'

export const PERSON_ID = `${siteUrl}/#person`
export const WEBSITE_ID = `${siteUrl}/#website`
const blogId = (locale: Locale) => `${absoluteUrl(homePath(locale))}#blog`

export function graph(...nodes: Thing[]): Graph {
  return { '@context': 'https://schema.org', '@graph': nodes as Graph['@graph'] }
}

export function personNode(settings: SiteSettings, locale: Locale): Person {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: settings.authorName,
    url: absoluteUrl(staticPath(locale, '/about')),
    image: settings.avatarUrl,
    jobTitle: settings.authorJobTitle,
    description: locale === 'tr' ? settings.bioTr : settings.bioEn,
    sameAs: settings.sameAs,
    knowsAbout: settings.knowsAbout,
  }
}

export function websiteNode(locale: Locale): WebSite {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: siteUrl,
    name: site.name[locale],
    description: site.tagline[locale],
    inLanguage: [site.htmlLang.tr, site.htmlLang.en],
    publisher: { '@id': PERSON_ID },
    author: { '@id': PERSON_ID },
  }
}

export function blogNode(locale: Locale, posts: PostSummary[]): Blog {
  return {
    '@type': 'Blog',
    '@id': blogId(locale),
    url: absoluteUrl(homePath(locale)),
    name: site.name[locale],
    description: site.tagline[locale],
    inLanguage: site.htmlLang[locale],
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    isPartOf: { '@id': WEBSITE_ID },
    blogPost: posts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      '@id': `${absoluteUrl(postPath(post.locale, post.slug))}#article`,
      headline: post.title,
      url: absoluteUrl(postPath(post.locale, post.slug)),
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
    })),
  }
}

interface BlogPostingInput {
  post: Post
  imageUrl: string
  translations: PostSummary[]
  comments: PublicComment[]
}

export function blogPostingNode({
  post,
  imageUrl,
  translations,
  comments,
}: BlogPostingInput): BlogPosting {
  const url = absoluteUrl(postPath(post.locale, post.slug))
  const translationRefs = translations.map((t) => ({
    '@type': 'BlogPosting' as const,
    '@id': `${absoluteUrl(postPath(t.locale, t.slug))}#article`,
    inLanguage: site.htmlLang[t.locale],
  }))
  const commentNodes: Comment[] = comments.slice(0, 20).map((c) => ({
    '@type': 'Comment',
    text: c.body,
    dateCreated: c.createdAt,
    author: c.isAuthorReply ? { '@id': PERSON_ID } : { '@type': 'Person', name: c.authorName },
  }))

  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: post.seoTitle || post.title,
    description: post.description,
    image: [imageUrl],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    inLanguage: site.htmlLang[post.locale],
    isPartOf: { '@id': blogId(post.locale) },
    wordCount: post.wordCount,
    timeRequired: `PT${post.readingMinutes}M`,
    keywords: post.tags.join(', '),
    articleSection: post.tags[0],
    abstract: post.tldr.length ? post.tldr.join(' ') : undefined,
    citation: post.sources.map((s) => ({
      '@type': 'CreativeWork' as const,
      name: s.title,
      url: s.url,
    })),
    ...(post.locale === 'tr'
      ? { workTranslation: translationRefs }
      : { translationOfWork: translationRefs[0] }),
    commentCount: comments.length,
    comment: commentNodes.length ? commentNodes : undefined,
  }
}

export function breadcrumbNode(items: { name: string; path: string }[]): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqNode(post: Post): FAQPage | null {
  if (!post.faq.length) return null
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(postPath(post.locale, post.slug))}#faq`,
    mainEntity: post.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export function collectionPageNode(input: {
  locale: Locale
  name: string
  description: string
  path: string
  posts: PostSummary[]
}): CollectionPage {
  const url = absoluteUrl(input.path)
  return {
    '@type': 'CollectionPage',
    '@id': url,
    url,
    name: input.name,
    description: input.description,
    inLanguage: site.htmlLang[input.locale],
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: input.posts.slice(0, 50).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(postPath(post.locale, post.slug)),
        name: post.title,
      })),
    },
  }
}

export function profilePageNode(locale: Locale, settings: SiteSettings): ProfilePage {
  const url = absoluteUrl(staticPath(locale, '/about'))
  return {
    '@type': 'ProfilePage',
    '@id': url,
    url,
    inLanguage: site.htmlLang[locale],
    mainEntity: personNode(settings, locale),
    isPartOf: { '@id': WEBSITE_ID },
  }
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
