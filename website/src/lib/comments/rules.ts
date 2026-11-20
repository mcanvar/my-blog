import { z } from 'zod'

/** Shared by the comment form (client) and the comment-guard Lambda (server). */
export const COMMENT_LIMITS = {
  nameMin: 2,
  nameMax: 50,
  bodyMin: 3,
  bodyMax: 2000,
  maxLinks: 2,
  minElapsedMs: 3000,
  /** reCAPTCHA tokens are about 2 KB; anything far larger is not a real token. */
  tokenMax: 4096,
} as const

const URL_PATTERN = /\bhttps?:\/\/\S+|\bwww\.\S+/gi

export function countLinks(text: string): number {
  return text.match(URL_PATTERN)?.length ?? 0
}

// Bidi overrides and isolates, plus invisible characters that can disguise text.
// ZWNJ and ZWJ (U+200C, U+200D) stay: emoji sequences and some scripts need them.
const INVISIBLE = new Set([
  0x061c, 0x200b, 0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2060, 0x2066, 0x2067,
  0x2068, 0x2069, 0xfeff,
])

/** Removes control characters (except tab and line breaks) and bidi or invisible formatting characters. */
export function stripUnsafeCharacters(value: string): string {
  let result = ''
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    const isControl =
      (code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d) ||
      (code >= 0x7f && code <= 0x9f)
    if (isControl || INVISIBLE.has(code)) continue
    result += char
  }
  return result
}

const cleaned = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? stripUnsafeCharacters(value) : value),
    schema
  )

export const commentInputSchema = z.object({
  postId: z.string().min(1).max(64),
  parentId: z.string().min(1).max(64).nullish(),
  authorName: cleaned(
    z
      .string()
      .trim()
      .min(COMMENT_LIMITS.nameMin)
      .max(COMMENT_LIMITS.nameMax)
      .refine((v) => !/[<>]/.test(v), 'invalid characters')
      .refine((v) => countLinks(v) === 0, 'links are not allowed in the name')
  ),
  body: cleaned(
    z
      .string()
      .trim()
      .min(COMMENT_LIMITS.bodyMin)
      .max(COMMENT_LIMITS.bodyMax)
      .refine((v) => countLinks(v) <= COMMENT_LIMITS.maxLinks, 'too many links')
  ),
})

export type CommentInput = z.infer<typeof commentInputSchema>

function nameKey(name: string): string {
  return name
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/** True when a visitor's name is the site author's name, ignoring case, accents, spacing and punctuation. */
export function impersonatesAuthor(name: string, authorName: string): boolean {
  const visitor = nameKey(name)
  const author = nameKey(authorName)
  return visitor.length > 0 && author.length > 0 && visitor.includes(author)
}

export type CommentResultCode =
  'PENDING' | 'INVALID' | 'CLOSED' | 'RATE_LIMITED' | 'VERIFICATION_FAILED' | 'ERROR'

/** Rejected/spam comments are purged by DynamoDB TTL after this many days. */
export const COMMENT_PURGE_DAYS = 30
