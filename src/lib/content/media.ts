/**
 * Media lives in S3 behind CloudFront (cdn.mcanvar.dev in production). Content stores
 * site-relative paths (`/media/...`) so the CDN domain can change without rewriting posts.
 *
 * File names carry their dimensions: `name-a1b2c3-rs-2000x1125.webp`. The `-rs-` marker means
 * smaller responsive copies were uploaded next to it (`….w640.webp`, `….w1200.webp`).
 */
export const MEDIA_PREFIX = '/media/'
export const RESPONSIVE_MARKER = '-rs-'
export const RESPONSIVE_WIDTHS = [640, 1200] as const
/** Unique file names never change, so browsers and CloudFront may keep them for a year. */
export const MEDIA_CACHE_CONTROL = 'public, max-age=31536000, immutable'
/** Article column is ~46rem wide on desktop; full width on phones. */
export const CONTENT_IMAGE_SIZES = '(min-width: 64rem) 46rem, 100vw'

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

export function variantPath(src: string, width: number): string {
  return src.replace(/\.webp$/i, `.w${width}.webp`)
}

export function isVariantPath(path: string): boolean {
  return /\.w\d+\.webp$/i.test(path)
}

/** Widths of the smaller copies uploaded for an image of `width` pixels. */
export function variantWidths(width: number): number[] {
  return RESPONSIVE_WIDTHS.filter((w) => w < width)
}

/** `srcset` for uploaded responsive images; null for anything else (external, old uploads). */
export function responsiveSrcSet(src: string, mediaBaseUrl: string | undefined): string | null {
  if (!src.startsWith(MEDIA_PREFIX) || !src.includes(RESPONSIVE_MARKER)) return null
  const size = dimensionsFromPath(src)
  if (!size) return null
  const candidates = variantWidths(size.width).map(
    (w) => `${resolveMediaUrl(variantPath(src, w), mediaBaseUrl)} ${w}w`
  )
  candidates.push(`${resolveMediaUrl(src, mediaBaseUrl)} ${size.width}w`)
  return candidates.join(', ')
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
