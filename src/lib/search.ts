export interface SearchEntry {
  title: string
  description: string
  tags: string[]
  year: number
  path: string
  minutes: number
}

export interface SearchIndex {
  posts: SearchEntry[]
  tags: { tag: string; path: string; count: number }[]
}

const FOLD: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  â: 'a',
  î: 'i',
  û: 'u',
}

/** Case- and accent-insensitive, Turkish-aware ("İstanbul" matches "istanbul" and "Istanbul"). */
export function fold(text: string): string {
  return text
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşüâîû]/g, (c) => FOLD[c] ?? c)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function searchPosts(entries: SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const terms = fold(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return entries.slice(0, limit)

  return entries
    .map((entry) => {
      const title = fold(entry.title)
      const tags = fold(entry.tags.join(' '))
      const description = fold(entry.description)
      let score = 0
      for (const term of terms) {
        if (title.includes(term)) score += title.startsWith(term) ? 6 : 4
        else if (tags.includes(term)) score += 3
        else if (description.includes(term)) score += 1
        else return { entry, score: 0 }
      }
      return { entry, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.year - a.entry.year)
    .slice(0, limit)
    .map((x) => x.entry)
}
