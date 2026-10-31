import { mediaBaseUrl } from '@/lib/amplify/outputs'
import { resolveMediaUrl } from '@/lib/content/media'
import { getPost } from '@/lib/data/public'
import { renderOgCard } from '@/lib/og'
import { PRODUCTION_HOST } from '@/lib/site'
import { LOCALES, type Locale } from '@/lib/types'

/** Per-post social card: title, reading time, first tag and the cover when there is one. */
export async function GET(_request: Request, { params }: RouteContext<'/api/og/[locale]/[slug]'>) {
  const { locale: rawLocale, slug } = await params
  if (!LOCALES.includes(rawLocale as Locale)) return new Response('Not found', { status: 404 })
  const locale = rawLocale as Locale
  const post = await getPost(locale, decodeURIComponent(slug))
  if (!post) return new Response('Not found', { status: 404 })

  const minutes =
    locale === 'tr' ? `${post.readingMinutes} dk okuma` : `${post.readingMinutes} min read`
  const tag = post.tags[0] ? ` · #${post.tags[0]}` : ''
  const cover = post.cover?.key ? resolveMediaUrl(post.cover.key, mediaBaseUrl) : null

  const image = await renderOgCard({
    eyebrow: 'Mevlüt Canvar',
    title: post.title,
    footer: `${PRODUCTION_HOST} · ${minutes}${tag}`,
    coverUrl: cover && /^https:\/\//.test(cover) ? cover : null,
  })
  image.headers.set(
    'Cache-Control',
    'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
  )
  return image
}
