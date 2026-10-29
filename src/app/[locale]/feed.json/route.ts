import { routing } from '@/i18n/routing'
import { buildJsonFeed } from '@/lib/geo/feeds'
import { LOCALES, type Locale } from '@/lib/types'

export const revalidate = 300

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function GET(_request: Request, { params }: RouteContext<'/[locale]/feed.json'>) {
  const { locale } = await params
  if (!LOCALES.includes(locale as Locale)) return new Response('Not found', { status: 404 })
  return Response.json(await buildJsonFeed(locale as Locale), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  })
}
