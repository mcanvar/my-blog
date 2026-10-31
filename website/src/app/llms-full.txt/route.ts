import { mediaBaseUrl } from '@/lib/amplify/outputs'
import { getPost, getPostSummaries, getSiteSettings } from '@/lib/data/public'
import { postToMarkdown } from '@/lib/geo/markdown-export'
import { textResponse } from '@/lib/seo/text-response'
import type { Post } from '@/lib/types'

export const dynamic = 'force-dynamic'

/** Every published post as Markdown, newest first, English then Turkish. */
export async function GET() {
  const settings = await getSiteSettings()
  const summaries = [...(await getPostSummaries('en')), ...(await getPostSummaries('tr'))]
  const posts = (await Promise.all(summaries.map((s) => getPost(s.locale, s.slug)))).filter(
    (p): p is Post => p !== null && !p.noindex
  )
  const body = posts
    .map((post) => postToMarkdown(post, settings.authorName, mediaBaseUrl))
    .join('\n\n---\n\n')

  return textResponse(body, 'text/plain; charset=utf-8')
}
