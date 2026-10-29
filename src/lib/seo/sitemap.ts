import { mediaBaseUrl } from '../amplify/outputs'
import { resolveMediaUrl } from '../content/media'
import { getAllSummaries, getPostPage, getTags } from '../data/public'
import { absoluteUrl } from '../site'
import { LOCALES, type Locale } from '../types'
import { escapeXml } from './text-response'
import { homePath, pagePath, postPath, staticPath, tagPath } from './urls'

export interface SitemapEntry {
  url: string
  lastModified?: string
  changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority?: number
  languages?: Record<string, string>
  images?: string[]
}

function languages(paths: Partial<Record<Locale, string>>): Record<string, string> | undefined {
  const entries = Object.entries(paths).filter(([, path]) => path) as [Locale, string][]
  if (entries.length < 2) return undefined
  const result: Record<string, string> = Object.fromEntries(
    entries.map(([l, p]) => [l, absoluteUrl(p)])
  )
  result['x-default'] = result.tr ?? Object.values(result)[0]!
  return result
}

export async function sitemapEntries(): Promise<SitemapEntry[]> {
  const posts = await getAllSummaries()
  const latest = posts.reduce(
    (max, p) => (p.updatedAt > max ? p.updatedAt : max),
    '1970-01-01T00:00:00.000Z'
  )
  const entries: SitemapEntry[] = []

  for (const locale of LOCALES) {
    entries.push({
      url: absoluteUrl(homePath(locale)),
      lastModified: latest,
      changeFrequency: 'weekly',
      priority: 1,
      languages: languages({ tr: homePath('tr'), en: homePath('en') }),
    })
    for (const pathname of ['/archive', '/about', '/privacy'] as const) {
      entries.push({
        url: absoluteUrl(staticPath(locale, pathname)),
        lastModified: pathname === '/archive' ? latest : undefined,
        changeFrequency: pathname === '/archive' ? 'weekly' : 'yearly',
        priority: pathname === '/privacy' ? 0.2 : 0.5,
        languages: languages({ tr: staticPath('tr', pathname), en: staticPath('en', pathname) }),
      })
    }
    const { totalPages } = await getPostPage(locale, 1)
    for (let page = 2; page <= totalPages; page++) {
      entries.push({
        url: absoluteUrl(pagePath(locale, page)),
        changeFrequency: 'weekly',
        priority: 0.3,
      })
    }
    for (const tag of await getTags(locale)) {
      entries.push({
        url: absoluteUrl(tagPath(locale, tag.tag)),
        changeFrequency: 'weekly',
        priority: 0.4,
      })
    }
  }

  for (const post of posts) {
    const siblings = posts.filter((p) => p.translationKey === post.translationKey)
    const cover = post.cover ? resolveMediaUrl(post.cover.key, mediaBaseUrl) : null
    entries.push({
      url: absoluteUrl(postPath(post.locale, post.slug)),
      lastModified: post.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.8,
      languages: languages(
        Object.fromEntries(siblings.map((s) => [s.locale, postPath(s.locale, s.slug)]))
      ),
      images: cover && /^https:\/\//.test(cover) ? [cover] : undefined,
    })
  }

  return entries
}

export function sitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    const lines = [`    <loc>${escapeXml(entry.url)}</loc>`]
    if (entry.lastModified) lines.push(`    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`)
    if (entry.changeFrequency) lines.push(`    <changefreq>${entry.changeFrequency}</changefreq>`)
    if (entry.priority !== undefined) lines.push(`    <priority>${entry.priority}</priority>`)
    for (const [lang, href] of Object.entries(entry.languages ?? {})) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}" />`)
    }
    for (const image of entry.images ?? []) {
      lines.push(`    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`)
    }
    return `  <url>\n${lines.join('\n')}\n  </url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`
}
