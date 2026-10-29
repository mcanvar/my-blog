import { buildJsonFeed } from '@/lib/geo/feeds'
import { textResponse } from '@/lib/seo/text-response'
import { LOCALES, type Locale } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: RouteContext<'/[locale]/feed.json'>) {
  const { locale } = await params
  if (!LOCALES.includes(locale as Locale)) return new Response('Not found', { status: 404 })
  return textResponse(
    JSON.stringify(await buildJsonFeed(locale as Locale)),
    'application/feed+json; charset=utf-8'
  )
}
