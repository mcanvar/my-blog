import { z } from 'zod'

/** Shared by the comment form (client) and the comment-guard Lambda (server). */
export const COMMENT_LIMITS = {
  nameMin: 2,
  nameMax: 50,
  bodyMin: 3,
  bodyMax: 2000,
  maxLinks: 2,
  minElapsedMs: 3000,
} as const

const URL_PATTERN = /\bhttps?:\/\/\S+|\bwww\.\S+/gi

export function countLinks(text: string): number {
  return text.match(URL_PATTERN)?.length ?? 0
}

export const commentInputSchema = z.object({
  postId: z.string().min(1).max(64),
  parentId: z.string().min(1).max(64).nullish(),
  authorName: z
    .string()
    .trim()
    .min(COMMENT_LIMITS.nameMin)
    .max(COMMENT_LIMITS.nameMax)
    .refine((v) => !/[<>]/.test(v), 'invalid characters')
    .refine((v) => countLinks(v) === 0, 'links are not allowed in the name'),
  body: z
    .string()
    .trim()
    .min(COMMENT_LIMITS.bodyMin)
    .max(COMMENT_LIMITS.bodyMax)
    .refine((v) => countLinks(v) <= COMMENT_LIMITS.maxLinks, 'too many links'),
})

export type CommentInput = z.infer<typeof commentInputSchema>

export type CommentResultCode =
  'PENDING' | 'INVALID' | 'CLOSED' | 'RATE_LIMITED' | 'VERIFICATION_FAILED' | 'ERROR'

/** Rejected/spam comments are purged by DynamoDB TTL after this many days. */
export const COMMENT_PURGE_DAYS = 30
