import { buildRss } from '@/lib/geo/feeds'
import { textResponse } from '@/lib/seo/text-response'
import { LOCALES, type Locale } from '@/lib/types'

export const dynamic = 'force-dynamic'

/** /feed.xml (Turkish, via proxy rewrite) and /en/feed.xml. */
export async function GET(_request: Request, { params }: RouteContext<'/[locale]/feed.xml'>) {
  const { locale } = await params
  if (!LOCALES.includes(locale as Locale)) return new Response('Not found', { status: 404 })
  return textResponse(await buildRss(locale as Locale), 'application/rss+xml; charset=utf-8')
}
