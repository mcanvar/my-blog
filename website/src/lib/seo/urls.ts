import { getPathname } from '@/i18n/navigation'
import { tagSlug } from '../content/slug'
import { absoluteUrl } from '../site'
import type { Locale } from '../types'

export function homePath(locale: Locale): string {
  return getPathname({ locale, href: '/' })
}

export function postPath(locale: Locale, slug: string): string {
  return getPathname({ locale, href: { pathname: '/[slug]', params: { slug } } })
}

export function postMarkdownPath(locale: Locale, slug: string): string {
  return `${postPath(locale, slug)}.md`
}

export function tagPath(locale: Locale, tag: string): string {
  return getPathname({ locale, href: { pathname: '/tag/[tag]', params: { tag: tagSlug(tag) } } })
}

export function pagePath(locale: Locale, page: number): string {
  if (page <= 1) return homePath(locale)
  return getPathname({ locale, href: { pathname: '/page/[page]', params: { page: String(page) } } })
}

export function staticPath(locale: Locale, pathname: '/archive' | '/about' | '/privacy'): string {
  return getPathname({ locale, href: pathname })
}

export function feedPath(locale: Locale, format: 'xml' | 'json' = 'xml'): string {
  return locale === 'tr' ? `/feed.${format}` : `/en/feed.${format}`
}

/** Generated social cards (route handlers, so URLs never carry an internal locale prefix). */
export function ogImagePath(locale: Locale, slug?: string): string {
  return slug ? `/api/og/${locale}/${encodeURIComponent(slug)}` : `/api/og/${locale}`
}

export const absolute = absoluteUrl
