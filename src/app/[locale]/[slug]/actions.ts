'use server'

import { commentInputSchema, type CommentResultCode } from '@/lib/comments/rules'
import { fixtureStore } from '@/lib/data/fixtures/store'
import { isFixtureAdminAllowed } from '@/lib/data/source'

/** Local development only: lets the comment form work against fixtures. */
export async function submitFixtureComment(input: {
  postId: string
  parentId: string | null
  authorName: string
  body: string
}): Promise<CommentResultCode> {
  if (!isFixtureAdminAllowed()) return 'ERROR'
  const parsed = commentInputSchema.safeParse(input)
  if (!parsed.success) return 'INVALID'
  const store = fixtureStore()
  const post = store.posts.find((p) => p.id === parsed.data.postId)
  if (!post) return 'INVALID'
  store.comments.push({
    id: `c-${crypto.randomUUID().slice(0, 8)}`,
    postId: post.id,
    postSlug: post.slug,
    postLocale: post.locale,
    postTitle: post.title,
    parentId: parsed.data.parentId ?? null,
    authorName: parsed.data.authorName,
    body: parsed.data.body,
    createdAt: new Date().toISOString(),
    isAuthorReply: false,
    status: 'PENDING',
    recaptchaScore: 0.9,
  })
  return 'PENDING'
}
