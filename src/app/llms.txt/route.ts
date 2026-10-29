import { getPostSummaries, getSiteSettings } from '@/lib/data/public'
import { homePath, postMarkdownPath, staticPath } from '@/lib/seo/urls'
import { textResponse } from '@/lib/seo/text-response'
import { absoluteUrl, site } from '@/lib/site'

export const dynamic = 'force-dynamic'

/** https://llmstxt.org — a map of the site for language models. */
export async function GET() {
  const [tr, en, settings] = await Promise.all([
    getPostSummaries('tr'),
    getPostSummaries('en'),
    getSiteSettings(),
  ])

  const lines = [
    `# ${settings.authorName}`,
    '',
    `> ${site.tagline.en} Personal blog of ${settings.authorName} (${settings.authorJobTitle}), written in Turkish and English. Every post is also available as plain Markdown by adding \`.md\` to its URL.`,
    '',
    `- Turkish home: ${absoluteUrl(homePath('tr'))}`,
    `- English home: ${absoluteUrl(homePath('en'))}`,
    `- About the author: ${absoluteUrl(staticPath('en', '/about'))}`,
    '',
    '## Posts (English)',
    '',
    ...en.map(
      (p) => `- [${p.title}](${absoluteUrl(postMarkdownPath('en', p.slug))}): ${p.description}`
    ),
    '',
    '## Yazılar (Türkçe)',
    '',
    ...tr.map(
      (p) => `- [${p.title}](${absoluteUrl(postMarkdownPath('tr', p.slug))}): ${p.description}`
    ),
    '',
    '## Optional',
    '',
    `- [Full text of every post](${absoluteUrl('/llms-full.txt')})`,
    `- [RSS (Turkish)](${absoluteUrl('/feed.xml')}) · [RSS (English)](${absoluteUrl('/en/feed.xml')})`,
    '',
  ]

  return textResponse(lines.join('\n'), 'text/plain; charset=utf-8')
}
