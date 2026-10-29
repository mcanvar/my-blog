/**
 * Media lives in S3 behind CloudFront. Content stores site-relative paths
 * (`/media/...`) so the CDN domain can change without rewriting posts.
 * Uploaded file names carry their dimensions: `name-1200x630.webp`.
 */
export const MEDIA_PREFIX = '/media/'

export function resolveMediaUrl(src: string, mediaBaseUrl: string | undefined): string {
  if (!src.startsWith(MEDIA_PREFIX)) return src
  if (!mediaBaseUrl) return src
  return `${mediaBaseUrl.replace(/\/$/, '')}${src}`
}

export function dimensionsFromPath(src: string): { width: number; height: number } | null {
  const match = /-(\d{2,5})x(\d{2,5})\.(?:webp|avif|png|jpe?g|gif)(?:$|\?)/i.exec(src)
  if (!match) return null
  return { width: Number(match[1]), height: Number(match[2]) }
}

/** Replace site-relative media links in Markdown with absolute URLs (feeds, .md, llms-full). */
export function absolutizeMarkdownMedia(
  markdown: string,
  mediaBaseUrl: string | undefined
): string {
  if (!mediaBaseUrl) return markdown
  const base = mediaBaseUrl.replace(/\/$/, '')
  return markdown.replace(/\]\(\/media\//g, `](${base}/media/`)
}
