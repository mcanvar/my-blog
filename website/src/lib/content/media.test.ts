import { describe, expect, it } from 'vitest'
import {
  absolutizeMarkdownMedia,
  dimensionsFromPath,
  isVariantPath,
  resolveMediaUrl,
  responsiveSrcSet,
  variantPath,
  variantWidths,
} from './media'

const CDN = 'https://cdn.mcanvar.dev'

describe('media paths', () => {
  it('resolves only /media/ paths through the CDN', () => {
    expect(resolveMediaUrl('/media/2026/a-1x1.webp', CDN)).toBe(`${CDN}/media/2026/a-1x1.webp`)
    expect(resolveMediaUrl('https://example.com/a.png', CDN)).toBe('https://example.com/a.png')
  })

  it('reads dimensions from the file name', () => {
    expect(dimensionsFromPath('/media/2026/trail-ab12cd-rs-2000x1125.webp')).toEqual({
      width: 2000,
      height: 1125,
    })
    expect(dimensionsFromPath('/media/no-size.webp')).toBeNull()
  })

  it('names and recognises responsive copies', () => {
    expect(variantPath('/media/2026/a-rs-2000x1125.webp', 640)).toBe(
      '/media/2026/a-rs-2000x1125.w640.webp'
    )
    expect(isVariantPath('/media/2026/a-rs-2000x1125.w640.webp')).toBe(true)
    expect(isVariantPath('/media/2026/a-rs-2000x1125.webp')).toBe(false)
    expect(variantWidths(2000)).toEqual([640, 1200])
    expect(variantWidths(900)).toEqual([640])
    expect(variantWidths(500)).toEqual([])
  })

  it('builds srcset only for uploads that have responsive copies', () => {
    expect(responsiveSrcSet('/media/2026/a-rs-2000x1125.webp', CDN)).toBe(
      `${CDN}/media/2026/a-rs-2000x1125.w640.webp 640w, ${CDN}/media/2026/a-rs-2000x1125.w1200.webp 1200w, ${CDN}/media/2026/a-rs-2000x1125.webp 2000w`
    )
    expect(responsiveSrcSet('/media/2026/a-rs-500x300.webp', CDN)).toBe(
      `${CDN}/media/2026/a-rs-500x300.webp 500w`
    )
    expect(responsiveSrcSet('/media/2026/old-1200x630.webp', CDN)).toBeNull()
    expect(responsiveSrcSet('https://example.com/a-rs-2000x1000.webp', CDN)).toBeNull()
  })

  it('absolutizes Markdown media links for feeds and .md exports', () => {
    expect(absolutizeMarkdownMedia('![x](/media/a.webp) [y](/other)', CDN)).toBe(
      `![x](${CDN}/media/a.webp) [y](/other)`
    )
  })
})
