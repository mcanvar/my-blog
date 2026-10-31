import { mediaBaseUrl } from '@/lib/amplify/outputs'
import { getPost, getSiteSettings } from '@/lib/data/public'
import { postToMarkdown } from '@/lib/geo/markdown-export'
import { postPath } from '@/lib/seo/urls'
import { absoluteUrl } from '@/lib/site'
import { LOCALES, type Locale } from '@/lib/types'

export const dynamic = 'force-dynamic'

/** Served at /<slug>.md and /en/<slug>.md (rewritten by the proxy). */
export async function GET(_request: Request, { params }: RouteContext<'/api/md/[locale]/[slug]'>) {
  const { locale, slug } = await params
  if (!LOCALES.includes(locale as Locale)) return new Response('Not found', { status: 404 })

  const [post, settings] = await Promise.all([
    getPost(locale as Locale, decodeURIComponent(slug)),
    getSiteSettings(),
  ])
  if (!post || post.noindex) return new Response('Not found', { status: 404 })

  return new Response(postToMarkdown(post, settings.authorName, mediaBaseUrl), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Link: `<${absoluteUrl(postPath(post.locale, post.slug))}>; rel="canonical"`,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
