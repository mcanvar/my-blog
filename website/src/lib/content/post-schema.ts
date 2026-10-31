import { z } from 'zod'
import { LOCALES } from '../types'
import { validateSlug } from './slug'

const trimmed = (max: number) => z.string().trim().max(max)

const urlString = z
  .string()
  .trim()
  .url()
  .refine((v) => /^https?:\/\//.test(v), 'Must be an http(s) URL')

const mediaOrUrl = z
  .string()
  .trim()
  .refine(
    (v) => v.startsWith('/media/') || /^https:\/\//.test(v),
    'Use an uploaded /media/ path or an https URL'
  )

/** Editor payload validated on the server before anything is written. */
export const postInputSchema = z.object({
  translationKey: z.string().trim().min(1).max(80),
  locale: z.enum(LOCALES),
  slug: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const error = validateSlug(value)
      if (error) ctx.addIssue({ code: 'custom', message: error })
    }),
  title: z.string().trim().min(3, 'Title is required').max(140),
  seoTitle: trimmed(70).nullable(),
  description: z.string().trim().min(20, 'Write at least 20 characters').max(200),
  tldr: z.array(trimmed(300).min(1)).max(6),
  keyTakeaways: z.array(trimmed(300).min(1)).max(8),
  content: z.string().max(200_000),
  tags: z.array(trimmed(40).min(1)).max(8),
  cover: z
    .object({
      key: mediaOrUrl,
      alt: trimmed(200),
      width: z.number().int().positive().nullable().optional(),
      height: z.number().int().positive().nullable().optional(),
    })
    .nullable(),
  faq: z.array(z.object({ q: trimmed(300).min(1), a: trimmed(2000).min(1) })).max(12),
  sources: z.array(z.object({ title: trimmed(200).min(1), url: urlString })).max(30),
  publishedAt: z.string().datetime().nullable(),
  noindex: z.boolean(),
  canonicalUrl: urlString.nullable(),
  commentsEnabled: z.boolean(),
  needsReview: z.boolean(),
})

export type PostInput = z.infer<typeof postInputSchema>

export type FieldErrors = Partial<Record<keyof PostInput | string, string>>

export function fieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.')
    result[key] ??= issue.message
  }
  return result
}
