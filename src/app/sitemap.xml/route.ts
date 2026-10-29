import { sitemapEntries, sitemapXml } from '@/lib/seo/sitemap'
import { textResponse } from '@/lib/seo/text-response'

export const dynamic = 'force-dynamic'

export async function GET() {
  return textResponse(sitemapXml(await sitemapEntries()), 'application/xml; charset=utf-8')
}
