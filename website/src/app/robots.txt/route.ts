import { getSiteSettings } from '@/lib/data/public'
import { AI_CRAWLERS } from '@/lib/geo/crawlers'
import { textResponse } from '@/lib/seo/text-response'
import { absoluteUrl, isIndexable, siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

const PRIVATE_PATHS = ['/admin', '/api/']
// Social cards live under /api/og/ and must stay fetchable (e.g. Twitterbot honours robots.txt).
const PUBLIC_PATHS = ['/', '/api/og/']

function group(userAgent: string, rules: { allow?: string[]; disallow?: string[] }): string {
  return [
    `User-Agent: ${userAgent}`,
    ...(rules.allow ?? []).map((path) => `Allow: ${path}`),
    ...(rules.disallow ?? []).map((path) => `Disallow: ${path}`),
  ].join('\n')
}

export async function GET() {
  if (!isIndexable)
    return textResponse(`${group('*', { disallow: ['/'] })}\n`, 'text/plain; charset=utf-8')

  const settings = await getSiteSettings()
  const blocked = new Set(settings.blockedCrawlers)
  const groups = [
    group('*', { allow: PUBLIC_PATHS, disallow: PRIVATE_PATHS }),
    // AI crawlers are welcome (GEO) unless blocked in admin settings.
    ...AI_CRAWLERS.map((agent) =>
      blocked.has(agent)
        ? group(agent, { disallow: ['/'] })
        : group(agent, { allow: PUBLIC_PATHS, disallow: PRIVATE_PATHS })
    ),
  ]
  const body = `${groups.join('\n\n')}\n\nHost: ${siteUrl}\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`
  return textResponse(body, 'text/plain; charset=utf-8')
}
