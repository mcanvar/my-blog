import { renderOgCard } from '@/lib/og'
import { PRODUCTION_HOST, site } from '@/lib/site'
import { LOCALES, type Locale } from '@/lib/types'

/** Default social card for pages without their own (home, archive, tags, about). */
export async function GET(_request: Request, { params }: RouteContext<'/api/og/[locale]'>) {
  const { locale } = await params
  if (!LOCALES.includes(locale as Locale)) return new Response('Not found', { status: 404 })
  const lang = locale as Locale
  const image = await renderOgCard({
    eyebrow: lang === 'tr' ? 'Kişisel blog' : 'Personal blog',
    title: `${site.name[lang]} — ${site.tagline[lang]}`,
    footer: PRODUCTION_HOST,
  })
  image.headers.set(
    'Cache-Control',
    'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400'
  )
  return image
}
