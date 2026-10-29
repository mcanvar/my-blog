'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { COMMENT_LIMITS, COMMENT_PURGE_DAYS } from '@/lib/comments/rules'
import { adminRepository } from '@/lib/data/admin'
import { CACHE_TAGS } from '@/lib/data/public'
import { postPath } from '@/lib/seo/urls'
import type { AdminComment, CommentStatus } from '@/lib/types'

function purgeAt(): number {
  return Math.floor(Date.now() / 1000) + COMMENT_PURGE_DAYS * 86_400
}

function revalidateComment(comment: AdminComment) {
  revalidateTag(CACHE_TAGS.comments, 'max')
  if (comment.postLocale && comment.postSlug)
    revalidatePath(postPath(comment.postLocale, comment.postSlug))
}

export async function moderateCommentAction(
  id: string,
  status: CommentStatus
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const repo = await adminRepository()
  const comment = await repo.getComment(id)
  if (!comment) return { ok: false, error: 'Comment not found.' }
  const expiresAt = status === 'REJECTED' || status === 'SPAM' ? purgeAt() : null
  await repo.updateComment(id, { status }, expiresAt)
  if (comment.status === 'APPROVED' || status === 'APPROVED') revalidateComment(comment)
  return { ok: true }
}

export async function deleteCommentAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  const repo = await adminRepository()
  const comment = await repo.getComment(id)
  if (!comment) return { ok: true }
  await repo.deleteComment(id)
  if (comment.status === 'APPROVED') revalidateComment(comment)
  return { ok: true }
}

const replySchema = z.string().trim().min(COMMENT_LIMITS.bodyMin).max(COMMENT_LIMITS.bodyMax)

/** Replying approves the parent too: answering a comment means it is fine to show. */
export async function replyToCommentAction(
  id: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()
  const parsed = replySchema.safeParse(body)
  if (!parsed.success)
    return {
      ok: false,
      error: `Replies need ${COMMENT_LIMITS.bodyMin}–${COMMENT_LIMITS.bodyMax} characters.`,
    }
  const repo = await adminRepository()
  const parent = await repo.getComment(id)
  if (!parent) return { ok: false, error: 'Comment not found.' }
  if (parent.status !== 'APPROVED') await repo.updateComment(id, { status: 'APPROVED' }, null)
  const settings = await repo.getSettings()
  await repo.createAuthorReply({ parent, body: parsed.data, authorName: settings.authorName })
  revalidateComment(parent)
  return { ok: true }
}
