import 'server-only'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { getAdminSession } from '../auth/admin'
import type { Locale, Post } from '../types'
import { adminRepository } from './admin'
import { adminToPublic } from './mappers'
import { getPost } from './public'

/**
 * Published post, or — in draft mode with a valid admin session — the latest
 * saved version regardless of status. Draft mode is only enabled by /api/draft.
 */
export const loadPost = cache(
  async (locale: Locale, slug: string): Promise<{ post: Post; preview: boolean } | null> => {
    const { isEnabled } = await draftMode()
    if (isEnabled && (await getAdminSession())) {
      const repo = await adminRepository()
      const [draft] = await repo.findPostsBySlug(locale, slug)
      if (draft) return { post: adminToPublic(draft), preview: true }
    }
    const post = await getPost(locale, slug)
    return post ? { post, preview: false } : null
  }
)
