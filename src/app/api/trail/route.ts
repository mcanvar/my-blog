import { NextResponse, type NextRequest } from 'next/server'
import { getPostPage } from '@/lib/data/public'
import { toTrailItems } from '@/lib/trail-items'
import { LOCALES, type Locale } from '@/lib/types'

/** Next page of the homepage trail (infinite horizontal loading). */
export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale') as Locale | null
  const page = Number(request.nextUrl.searchParams.get('page') ?? '1')
  if (!locale || !LOCALES.includes(locale) || !Number.isInteger(page) || page < 1 || page > 1000) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  const current = await getPostPage(locale, page)
  return NextResponse.json(
    { items: toTrailItems(current.items), page, totalPages: current.totalPages },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        'X-Robots-Tag': 'noindex',
      },
    }
  )
}
