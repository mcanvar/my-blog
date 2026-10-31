'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  deleteCommentAction,
  moderateCommentAction,
  replyToCommentAction,
} from '@/app/admin/actions/comments'
import { COMMENT_PURGE_DAYS } from '@/lib/comments/rules'
import { formatDateTime } from '@/lib/format'
import type { AdminComment, CommentStatus } from '@/lib/types'
import { ExternalIcon } from '../icons'
import { EmptyState, StatusBadge } from './ui'

function CommentCard({ comment }: { comment: AdminComment }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState('')
  const [error, setError] = useState<string | null>(null)
  const postHref = comment.postSlug
    ? `${comment.postLocale === 'en' ? '/en' : ''}/${comment.postSlug}`
    : null

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) setError(result.error ?? 'Something went wrong')
      else router.refresh()
    })
  }

  const actions: { label: string; status: CommentStatus; primary?: boolean }[] = (
    [
      { label: 'Approve', status: 'APPROVED', primary: true },
      { label: 'Reject', status: 'REJECTED' },
      { label: 'Spam', status: 'SPAM' },
      { label: 'Back to pending', status: 'PENDING' },
    ] as const
  ).filter((a) => a.status !== comment.status)

  return (
    <li
      className={`rounded-xl border border-[#e4e3dd] bg-white p-4 ${pending ? 'opacity-60' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">{comment.authorName}</span>
        {comment.isAuthorReply && <StatusBadge status="APPROVED" />}
        <span className="text-xs text-fern">{formatDateTime(comment.createdAt, 'en')}</span>
        {comment.recaptchaScore !== null && (
          <span
            className="rounded bg-paper px-1.5 text-[0.65rem] text-fern"
            title="reCAPTCHA score (1 = human)"
          >
            score {comment.recaptchaScore.toFixed(1)}
          </span>
        )}
        {comment.parentId && <span className="text-[0.65rem] text-sage">reply</span>}
        {postHref && (
          <a
            href={`${postHref}#comment-${comment.id}`}
            target="_blank"
            rel="noopener"
            className="ml-auto flex items-center gap-1 text-xs text-fern hover:text-ink"
          >
            {comment.postTitle} <ExternalIcon size={12} />
          </a>
        )}
      </div>
      <p className="mt-2 font-body text-sm leading-relaxed whitespace-pre-line">{comment.body}</p>
      {error && <p className="mt-2 text-xs text-[#a65151]">{error}</p>}

      {replying && (
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            className="field bg-white font-body"
            placeholder="Your reply (published immediately)"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn py-1 text-xs"
              disabled={pending}
              onClick={() => run(() => replyToCommentAction(comment.id, reply))}
            >
              Publish reply
            </button>
            <button
              type="button"
              className="btn-outline py-1 text-xs"
              onClick={() => setReplying(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.status}
            type="button"
            disabled={pending}
            onClick={() => run(() => moderateCommentAction(comment.id, action.status))}
            className={action.primary ? 'btn py-1 text-xs' : 'btn-outline py-1 text-xs'}
          >
            {action.label}
          </button>
        ))}
        {!comment.parentId && !replying && (
          <button
            type="button"
            className="btn-outline py-1 text-xs"
            onClick={() => setReplying(true)}
          >
            Reply
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (window.confirm('Delete this comment (and its replies) permanently?'))
              run(() => deleteCommentAction(comment.id))
          }}
          className="btn-outline ml-auto border-[#e6c9c9] py-1 text-xs text-[#6b2d2d]"
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export function CommentQueue({
  comments,
  status,
}: {
  comments: AdminComment[]
  status: CommentStatus
}) {
  if (comments.length === 0) {
    return (
      <EmptyState>
        {status === 'PENDING' ? 'No comments waiting for approval. 🌿' : 'Nothing here.'}
      </EmptyState>
    )
  }
  return (
    <>
      {(status === 'SPAM' || status === 'REJECTED') && (
        <p className="text-xs text-fern">
          These are deleted automatically {COMMENT_PURGE_DAYS} days after moderation.
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </ul>
    </>
  )
}
