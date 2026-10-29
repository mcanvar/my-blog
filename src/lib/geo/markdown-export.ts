import { absolutizeMarkdownMedia } from '../content/media'
import { postPath } from '../seo/urls'
import { absoluteUrl } from '../site'
import type { Post } from '../types'

const LABELS = {
  tr: { tldr: 'Kısaca', takeaways: 'Akılda kalsın', faq: 'Sık sorulanlar', sources: 'Kaynaklar' },
  en: { tldr: 'TL;DR', takeaways: 'Key takeaways', faq: 'FAQ', sources: 'Sources' },
}

function yamlString(value: string): string {
  return JSON.stringify(value)
}

/** Plain-Markdown version of a post for AI engines and readers (served at /slug.md). */
export function postToMarkdown(post: Post, authorName: string, mediaBaseUrl?: string): string {
  const labels = LABELS[post.locale]
  const url = absoluteUrl(postPath(post.locale, post.slug))
  const lines: string[] = [
    '---',
    `title: ${yamlString(post.title)}`,
    `description: ${yamlString(post.description)}`,
    `url: ${url}`,
    `language: ${post.locale}`,
    `author: ${yamlString(authorName)}`,
    `published: ${post.publishedAt}`,
    `updated: ${post.updatedAt}`,
    `tags: [${post.tags.map(yamlString).join(', ')}]`,
    '---',
    '',
    `# ${post.title}`,
    '',
  ]

  if (post.tldr.length) {
    lines.push(`> **${labels.tldr}**`, '>')
    for (const line of post.tldr) lines.push(`> - ${line}`)
    lines.push('')
  }

  lines.push(absolutizeMarkdownMedia(post.content.trim(), mediaBaseUrl), '')

  if (post.keyTakeaways.length) {
    lines.push(`## ${labels.takeaways}`, '')
    post.keyTakeaways.forEach((line, i) => lines.push(`${i + 1}. ${line}`))
    lines.push('')
  }
  if (post.faq.length) {
    lines.push(`## ${labels.faq}`, '')
    for (const item of post.faq) lines.push(`### ${item.q}`, '', item.a, '')
  }
  if (post.sources.length) {
    lines.push(`## ${labels.sources}`, '')
    for (const source of post.sources) lines.push(`- [${source.title}](${source.url})`)
    lines.push('')
  }

  return lines.join('\n')
}
