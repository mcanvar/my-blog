import type { Metadata } from 'next'
import { absoluteUrl, isIndexable, site } from '../site'
import type { Locale } from '../types'
import { feedPath, ogImagePath } from './urls'

interface PageMetadataInput {
  locale: Locale
  title: string
  description: string
  /** Site-relative path of this page in this locale. */
  path: string
  /** Paths of this page in each available locale (hreflang). Include the current one. */
  languages?: Partial<Record<Locale, string>>
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  authorName?: string
  noindex?: boolean
  canonicalUrl?: string | null
  absoluteTitle?: boolean
  /** Plain-Markdown copy of this page (GEO). */
  markdownPath?: string
  /** Social card path; defaults to the site card for this locale. */
  imagePath?: string
}

export function buildMetadata(input: PageMetadataInput): Metadata {
  const url = absoluteUrl(input.path)
  const languages: Record<string, string> = {}
  for (const [locale, path] of Object.entries(input.languages ?? {})) {
    if (path) languages[locale] = absoluteUrl(path)
  }
  if (Object.keys(languages).length > 1) {
    languages['x-default'] = languages.tr ?? url
  }
  const otherLocales = Object.keys(input.languages ?? {}).filter(
    (l) => l !== input.locale
  ) as Locale[]
  const noindex = input.noindex || !isIndexable
  const image = {
    url: absoluteUrl(input.imagePath ?? ogImagePath(input.locale)),
    width: 1200,
    height: 630,
    alt: input.title,
  }

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: {
      canonical: input.canonicalUrl || url,
      languages: Object.keys(languages).length > 1 ? languages : undefined,
      types: {
        'application/rss+xml': absoluteUrl(feedPath(input.locale, 'xml')),
        'application/feed+json': absoluteUrl(feedPath(input.locale, 'json')),
        ...(input.markdownPath ? { 'text/markdown': absoluteUrl(input.markdownPath) } : {}),
      },
    },
    openGraph: {
      type: input.type ?? 'website',
      url,
      title: input.title,
      description: input.description,
      siteName: site.name[input.locale],
      locale: site.ogLocale[input.locale],
      alternateLocale: otherLocales.map((l) => site.ogLocale[l]),
      images: [image],
      ...(input.type === 'article'
        ? {
            publishedTime: input.publishedTime,
            modifiedTime: input.modifiedTime,
            authors: input.authorName ? [input.authorName] : undefined,
            tags: input.tags,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image.url],
    },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
  }
}
