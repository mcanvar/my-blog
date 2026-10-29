import type { MetadataRoute } from 'next'
import { getSiteSettings } from '@/lib/data/public'
import { AI_CRAWLERS } from '@/lib/geo/crawlers'
import { absoluteUrl, isIndexable, siteUrl } from '@/lib/site'

export const revalidate = 300

const PRIVATE_PATHS = ['/admin', '/api/']
// Social cards live under /api/og/ and must stay fetchable (e.g. Twitterbot honours robots.txt).
const PUBLIC_PATHS = ['/', '/api/og/']

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!isIndexable) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  const settings = await getSiteSettings()
  const blocked = new Set(settings.blockedCrawlers)

  return {
    rules: [
      { userAgent: '*', allow: PUBLIC_PATHS, disallow: PRIVATE_PATHS },
      // AI crawlers are welcome (GEO) unless blocked in admin settings.
      ...AI_CRAWLERS.map((userAgent) =>
        blocked.has(userAgent)
          ? { userAgent, disallow: '/' }
          : { userAgent, allow: PUBLIC_PATHS, disallow: PRIVATE_PATHS }
      ),
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl,
  }
}
