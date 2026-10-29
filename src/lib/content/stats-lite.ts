/** Client-side word count for the editor (no Markdown parser in the browser bundle). */
export function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
  const words = text.trim().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)
  return words ? words.length : 0
}
