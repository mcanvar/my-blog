import { NextResponse, type NextRequest } from 'next/server'
import { getPostSummaries, getTags } from '@/lib/data/public'
import { yearOf } from '@/lib/format'
import type { SearchIndex } from '@/lib/search'
import { postPath, tagPath } from '@/lib/seo/urls'
import { LOCALES, type Locale } from '@/lib/types'

/** Small per-locale index for the ⌘K palette; filtered in the browser. */
export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale') as Locale | null
  if (!locale || !LOCALES.includes(locale)) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  const [posts, tags] = await Promise.all([getPostSummaries(locale), getTags(locale)])
  const index: SearchIndex = {
    posts: posts.map((p) => ({
      title: p.title,
      description: p.description,
      tags: p.tags,
      year: yearOf(p.publishedAt),
      path: postPath(locale, p.slug),
      minutes: p.readingMinutes,
    })),
    tags: tags.map((t) => ({ tag: t.tag, path: tagPath(locale, t.tag), count: t.count })),
  }
  return NextResponse.json(index, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      'X-Robots-Tag': 'noindex',
    },
  })
}
