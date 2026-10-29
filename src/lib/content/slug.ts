const TURKISH_MAP: Record<string, string> = {
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

/** Turkish-aware slug: "Neden Bölge Değiştirdim?" → "neden-bolge-degistirdim". */
export function slugify(input: string, maxLength = 80): string {
  return input
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşüâîû]/g, (c) => TURKISH_MAP[c] ?? c)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '')
}

/** Top-level paths a post slug must never take (posts live at /<slug> and /en/<slug>). */
export const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'en',
  'tr',
  'sayfa',
  'page',
  'etiket',
  'tag',
  'arsiv',
  'archive',
  'hakkimda',
  'about',
  'gizlilik',
  'privacy',
  'media',
  'feed.xml',
  'feed.json',
  'sitemap.xml',
  'robots.txt',
  'llms.txt',
  'llms-full.txt',
  'manifest.webmanifest',
  'opengraph-image',
  'icon',
  'apple-icon',
  'favicon.ico',
  '_next',
])

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateSlug(slug: string): string | null {
  if (!slug) return 'Slug is required.'
  if (slug.length > 80) return 'Slug must be 80 characters or fewer.'
  if (!SLUG_PATTERN.test(slug)) return 'Use lowercase letters, numbers and single dashes only.'
  if (RESERVED_SLUGS.has(slug)) return `"${slug}" is reserved by the site.`
  return null
}

/** Tags are stored as display text; URLs use their slug. */
export function tagSlug(tag: string): string {
  return slugify(tag, 40)
}
