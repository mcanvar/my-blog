import type { Schema } from '@/amplify/data/resource'
import type { CommentResultCode } from './rules'

export interface SubmitCommentInput {
  postId: string
  parentId: string | null
  authorName: string
  body: string
  recaptchaToken: string
  honeypot: string
  elapsedMs: number
}

/**
 * Sent from the browser with identity-pool guest credentials so the comment
 * guard sees the visitor's real IP. Loaded lazily: only when someone comments.
 */
export async function submitCommentViaAmplify(
  input: SubmitCommentInput
): Promise<CommentResultCode> {
  const [{ Amplify }, { generateClient }, outputs] = await Promise.all([
    import('aws-amplify'),
    import('aws-amplify/data'),
    import('@/amplify_outputs.json'),
  ])
  Amplify.configure(outputs.default, { ssr: true })
  const client = generateClient<Schema>({ authMode: 'identityPool' })
  const { data, errors } = await client.mutations.submitComment(input)
  if (errors?.length || !data) return 'ERROR'
  return (data.code as CommentResultCode | null) ?? 'ERROR'
}
