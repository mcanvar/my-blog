import { toString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const WORDS_PER_MINUTE = 200

export function markdownToPlainText(markdown: string): string {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown)
  return toString(tree, { includeImageAlt: false })
}

export function countWords(text: string): number {
  const words = text.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)
  return words ? words.length : 0
}

export function contentStats(markdown: string): { wordCount: number; readingMinutes: number } {
  const wordCount = countWords(markdownToPlainText(markdown))
  return { wordCount, readingMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)) }
}

export function excerpt(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : cut.length)}…`
}
