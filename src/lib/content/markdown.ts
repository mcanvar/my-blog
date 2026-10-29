import type { Element, Root } from 'hast'
import { toString } from 'hast-util-to-string'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import type { TocItem } from '../types'
import { CONTENT_IMAGE_SIZES, dimensionsFromPath, resolveMediaUrl, responsiveSrcSet } from './media'

export interface RenderedMarkdown {
  html: string
  toc: TocItem[]
}

interface RenderOptions {
  mediaBaseUrl?: string
  siteHost?: string
}

/** Images: resolve /media/ paths, add intrinsic size and responsive srcset, lazy-load. */
function rehypeMedia(options: RenderOptions) {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return
      const src = String(node.properties.src ?? '')
      const size = dimensionsFromPath(src)
      const srcSet = responsiveSrcSet(src, options.mediaBaseUrl)
      node.properties.src = resolveMediaUrl(src, options.mediaBaseUrl)
      if (srcSet) {
        node.properties.srcSet = srcSet
        node.properties.sizes = CONTENT_IMAGE_SIZES
      }
      node.properties.loading = 'lazy'
      node.properties.decoding = 'async'
      if (size) {
        node.properties.width = size.width
        node.properties.height = size.height
      }
    })
  }
}

/** External links get rel="noopener"; they stay followed so cited sources count. */
function rehypeLinks(options: RenderOptions) {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') return
      const href = String(node.properties.href ?? '')
      if (!/^https?:\/\//.test(href)) return
      try {
        if (options.siteHost && new URL(href).hostname === options.siteHost) return
      } catch {
        return
      }
      node.properties.rel = ['noopener']
    })
  }
}

function rehypeCollectToc(toc: TocItem[]) {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'h2' && node.tagName !== 'h3') return
      const id = node.properties.id
      if (typeof id !== 'string') return
      toc.push({
        id,
        text: toString(node).replace(/#$/, '').trim(),
        depth: node.tagName === 'h2' ? 2 : 3,
      })
    })
  }
}

// Raw HTML in Markdown is never parsed (no rehype-raw); sanitize also strips
// javascript: URLs and unknown attributes before anything else touches the tree.
const sanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: '',
  clobber: [],
}

export async function renderMarkdown(
  markdown: string,
  options: RenderOptions = {}
): Promise<RenderedMarkdown> {
  const toc: TocItem[] = []
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1 },
      content: { type: 'text', value: '#' },
    })
    .use(rehypeCollectToc, toc)
    .use(rehypeMedia, options)
    .use(rehypeLinks, options)
    .use(rehypePrettyCode, {
      theme: { light: 'github-light', dark: 'github-dark-dimmed' },
      keepBackground: false,
      defaultLang: { block: 'plaintext' },
    })
    .use(rehypeStringify)
    .process(markdown)

  return { html: String(file), toc }
}
