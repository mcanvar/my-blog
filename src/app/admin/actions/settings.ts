'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { adminRepository } from '@/lib/data/admin'
import { CACHE_TAGS } from '@/lib/data/public'
import type { SiteSettings } from '@/lib/types'

const httpsUrl = z
  .string()
  .trim()
  .url()
  .refine((v) => v.startsWith('https://'), 'Use an https URL')

const settingsSchema = z.object({
  authorName: z.string().trim().min(2).max(80),
  authorJobTitle: z.string().trim().max(120),
  bioTr: z.string().trim().max(600),
  bioEn: z.string().trim().max(600),
  avatarUrl: httpsUrl,
  sameAs: z.array(httpsUrl).max(12),
  knowsAbout: z.array(z.string().trim().min(1).max(60)).max(20),
  commentsEnabled: z.boolean(),
  commentsAutoCloseDays: z.number().int().min(1).max(3650).nullable(),
  recaptchaThreshold: z.number().min(0).max(1),
  blockedCrawlers: z.array(z.string().trim().min(1).max(60)).max(40),
})

export async function saveSettingsAction(
  input: SiteSettings
): Promise<{ ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> }> {
  await requireAdmin()
  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join('.')] ??= issue.message
    return { ok: false, error: 'Please fix the highlighted fields.', fieldErrors }
  }
  await (await adminRepository()).saveSettings(parsed.data)
  revalidateTag(CACHE_TAGS.settings, 'max')
  revalidatePath('/', 'layout')
  return { ok: true }
}
