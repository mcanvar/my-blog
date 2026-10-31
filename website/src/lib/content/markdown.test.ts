import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('builds a table of contents from h2/h3 with Turkish-friendly ids', async () => {
    const { html, toc } = await renderMarkdown(
      '## Neden bölge?\n\nMetin\n\n### Nasıl?\n\nDaha fazla'
    )
    expect(toc).toEqual([
      { id: expect.any(String), text: 'Neden bölge?', depth: 2 },
      { id: expect.any(String), text: 'Nasıl?', depth: 3 },
    ])
    expect(html).toContain(`id="${toc[0]!.id}"`)
  })

  it('never renders raw HTML or javascript: links', async () => {
    const { html } = await renderMarkdown(
      '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[click](javascript:alert(1))'
    )
    expect(html).not.toContain('<script')
    expect(html).not.toContain('onerror')
    expect(html).not.toContain('javascript:')
  })

  it('resolves /media/ images through the CDN and adds intrinsic size', async () => {
    const { html } = await renderMarkdown('![Patika](/media/2026/trail-ab12cd-1200x630.webp)', {
      mediaBaseUrl: 'https://cdn.example.net',
    })
    expect(html).toContain('src="https://cdn.example.net/media/2026/trail-ab12cd-1200x630.webp"')
    expect(html).toContain('width="1200"')
    expect(html).toContain('height="630"')
    expect(html).toContain('loading="lazy"')
  })

  it('adds srcset and sizes for responsive uploads', async () => {
    const { html } = await renderMarkdown('![Patika](/media/2026/trail-ab12cd-rs-2000x1125.webp)', {
      mediaBaseUrl: 'https://cdn.mcanvar.dev',
    })
    expect(html).toContain(
      'srcset="https://cdn.mcanvar.dev/media/2026/trail-ab12cd-rs-2000x1125.w640.webp 640w, https://cdn.mcanvar.dev/media/2026/trail-ab12cd-rs-2000x1125.w1200.webp 1200w, https://cdn.mcanvar.dev/media/2026/trail-ab12cd-rs-2000x1125.webp 2000w"'
    )
    expect(html).toContain('sizes="(min-width: 64rem) 46rem, 100vw"')
  })

  it('marks external links noopener but leaves own links alone', async () => {
    const { html } = await renderMarkdown('[a](https://example.com) [b](https://mcanvar.dev/x)', {
      siteHost: 'mcanvar.dev',
    })
    expect(html).toContain('href="https://example.com" rel="noopener"')
    expect(html).toContain('href="https://mcanvar.dev/x">')
  })

  it('highlights fenced code', async () => {
    const { html } = await renderMarkdown('```ts\nconst a = 1\n```')
    expect(html).toContain('data-rehype-pretty-code-figure')
  })
})
