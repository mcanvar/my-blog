import { mediaBaseUrl } from '../amplify/outputs'
import { renderMarkdown } from '../content/markdown'
import { getPost, getPostSummaries, getSiteSettings } from '../data/public'
import { feedPath, homePath, postPath } from '../seo/urls'
import { absoluteUrl, PRODUCTION_HOST, site } from '../site'
import type { Locale, Post } from '../types'

const FEED_SIZE = 20

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

async function latestPosts(locale: Locale): Promise<{ post: Post; html: string }[]> {
  const summaries = (await getPostSummaries(locale)).slice(0, FEED_SIZE)
  const posts = await Promise.all(summaries.map((s) => getPost(locale, s.slug)))
  return Promise.all(
    posts
      .filter((p): p is Post => p !== null)
      .map(async (post) => ({
        post,
        html: (await renderMarkdown(post.content, { mediaBaseUrl, siteHost: PRODUCTION_HOST }))
          .html,
      }))
  )
}

export async function buildRss(locale: Locale): Promise<string> {
  const [items, settings] = await Promise.all([latestPosts(locale), getSiteSettings()])
  const home = absoluteUrl(homePath(locale))
  const self = absoluteUrl(feedPath(locale, 'xml'))
  const updated = items[0]?.post.updatedAt ?? new Date().toISOString()

  const entries = items
    .map(({ post, html }) => {
      const url = absoluteUrl(postPath(locale, post.slug))
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(settings.authorName)}</dc:creator>
      <description>${escapeXml(post.description)}</description>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')}
      <content:encoded>${cdata(html)}</content:encoded>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(site.name[locale])}</title>
    <link>${home}</link>
    <description>${escapeXml(site.tagline[locale])}</description>
    <language>${site.htmlLang[locale]}</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
    <atom:link href="${self}" rel="self" type="application/rss+xml"/>
${entries}
  </channel>
</rss>
`
}

export async function buildJsonFeed(locale: Locale) {
  const [items, settings] = await Promise.all([latestPosts(locale), getSiteSettings()])
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: site.name[locale],
    home_page_url: absoluteUrl(homePath(locale)),
    feed_url: absoluteUrl(feedPath(locale, 'json')),
    description: site.tagline[locale],
    language: site.htmlLang[locale],
    authors: [
      { name: settings.authorName, url: absoluteUrl(homePath(locale)), avatar: settings.avatarUrl },
    ],
    items: items.map(({ post, html }) => ({
      id: absoluteUrl(postPath(locale, post.slug)),
      url: absoluteUrl(postPath(locale, post.slug)),
      title: post.title,
      summary: post.description,
      content_html: html,
      date_published: post.publishedAt,
      date_modified: post.updatedAt,
      tags: post.tags,
      language: site.htmlLang[locale],
    })),
  }
}
