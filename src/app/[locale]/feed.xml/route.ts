import { routing } from '@/i18n/routing'
import { buildRss } from '@/lib/geo/feeds'
import { LOCALES, type Locale } from '@/lib/types'

export const revalidate = 300

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

/** /feed.xml (Turkish, via proxy rewrite) and /en/feed.xml. */
export async function GET(_request: Request, { params }: RouteContext<'/[locale]/feed.xml'>) {
  const { locale } = await params
  if (!LOCALES.includes(locale as Locale)) return new Response('Not found', { status: 404 })
  return new Response(await buildRss(locale as Locale), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
