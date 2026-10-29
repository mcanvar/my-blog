'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { submitFixtureComment } from '@/app/[locale]/[slug]/actions'
import { COMMENT_LIMITS, commentInputSchema, type CommentResultCode } from '@/lib/comments/rules'
import { formatDateTime } from '@/lib/format'
import type { PublicComment } from '@/lib/types'
import { ChatIcon } from '../icons'

export type CommentsMode = 'amplify' | 'fixtures' | 'disabled'

interface CommentsSectionProps {
  postId: string
  comments: PublicComment[]
  mode: CommentsMode
  closed: boolean
  siteKey?: string
  privacyHref: string
}

const URL_SPLIT = /(https?:\/\/[^\s<]+)/
const IS_URL = /^https?:\/\//

function linkify(text: string): ReactNode[] {
  return text.split(URL_SPLIT).map((part, i) =>
    IS_URL.test(part) ? (
      <a key={i} href={part} rel="ugc nofollow noopener" className="break-all text-moss underline">
        {part}
      </a>
    ) : (
      part
    )
  )
}

function CommentItem({
  comment,
  replies,
  onReply,
  canReply,
}: {
  comment: PublicComment
  replies: PublicComment[]
  onReply: (comment: PublicComment) => void
  canReply: boolean
}) {
  const t = useTranslations('Comments')
  const locale = useLocale()
  return (
    <li id={`comment-${comment.id}`} className="scroll-mt-6">
      <article
        className={`rounded-2xl p-4 ${comment.isAuthorReply ? 'bg-nature-dark text-nature-lighter' : 'bg-surface'}`}
      >
        <header className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold">{comment.authorName}</span>
          {comment.isAuthorReply && (
            <span className="rounded-full bg-nature-lighter px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-nature-dark uppercase">
              {t('authorBadge')}
            </span>
          )}
          <time dateTime={comment.createdAt} className="text-xs opacity-60">
            {formatDateTime(comment.createdAt, locale === 'en' ? 'en' : 'tr')}
          </time>
        </header>
        <p className="mt-2 font-body leading-relaxed whitespace-pre-line">
          {linkify(comment.body)}
        </p>
        {canReply && !comment.parentId && (
          <button
            type="button"
            onClick={() => onReply(comment)}
            className="mt-2 text-sm font-semibold underline-offset-2 opacity-70 hover:underline"
          >
            {t('reply')}
          </button>
        )}
      </article>
      {replies.length > 0 && (
        <ol className="mt-3 ml-5 flex flex-col gap-3 border-l-2 border-dashed border-stone pl-4">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              onReply={onReply}
              canReply={false}
            />
          ))}
        </ol>
      )}
    </li>
  )
}

export function CommentsSection({
  postId,
  comments,
  mode,
  closed,
  siteKey,
  privacyHref,
}: CommentsSectionProps) {
  const t = useTranslations('Comments')
  const [replyTo, setReplyTo] = useState<PublicComment | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | CommentResultCode>('idle')
  const startedAt = useRef<number>(0)
  const formRef = useRef<HTMLFormElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const topLevel = comments.filter((c) => !c.parentId)
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id)
  const canComment = !closed && mode !== 'disabled'

  // Start the bot timer and warm up reCAPTCHA once the form is on screen.
  useEffect(() => {
    const form = formRef.current
    if (!form || !canComment) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      if (!startedAt.current) startedAt.current = Date.now()
      if (mode === 'amplify' && siteKey) {
        void import('@/lib/comments/recaptcha')
          .then((m) => m.loadRecaptcha(siteKey))
          .catch(() => undefined)
      }
      observer.disconnect()
    })
    observer.observe(form)
    return () => observer.disconnect()
  }, [canComment, mode, siteKey])

  function startReply(comment: PublicComment) {
    setReplyTo(comment)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => nameRef.current?.focus(), 300)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const input = {
      postId,
      parentId: replyTo?.id ?? null,
      authorName: String(data.get('authorName') ?? ''),
      body: String(data.get('body') ?? ''),
    }
    if (!commentInputSchema.safeParse(input).success) {
      setStatus('INVALID')
      return
    }
    setStatus('sending')
    try {
      let result: CommentResultCode
      if (mode === 'fixtures') {
        result = await submitFixtureComment(input)
      } else {
        if (!siteKey) throw new Error('missing site key')
        const [{ getRecaptchaToken }, { submitCommentViaAmplify }] = await Promise.all([
          import('@/lib/comments/recaptcha'),
          import('@/lib/comments/submit-amplify'),
        ])
        const recaptchaToken = await getRecaptchaToken(siteKey)
        result = await submitCommentViaAmplify({
          ...input,
          recaptchaToken,
          honeypot: String(data.get('website') ?? ''),
          elapsedMs: startedAt.current ? Date.now() - startedAt.current : 0,
        })
      }
      setStatus(result)
      if (result === 'PENDING') {
        form.reset()
        setReplyTo(null)
      }
    } catch {
      setStatus('ERROR')
    }
  }

  const message: Partial<Record<CommentResultCode, string>> = {
    PENDING: t('pending'),
    INVALID: t('invalid'),
    CLOSED: t('closed'),
    RATE_LIMITED: t('rateLimited'),
    VERIFICATION_FAILED: t('verificationFailed'),
    ERROR: t('error'),
  }
  const feedback = status !== 'idle' && status !== 'sending' ? message[status] : null

  return (
    <section aria-labelledby="comments-title" className="mt-14">
      <h2 id="comments-title" className="condensed flex items-center gap-2 text-2xl font-bold">
        <ChatIcon /> {t('title')}
        <span className="text-base font-medium text-fern">
          · {t('count', { count: comments.length })}
        </span>
      </h2>

      {topLevel.length > 0 && (
        <ol className="mt-6 flex flex-col gap-4">
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={repliesOf(comment.id)}
              onReply={startReply}
              canReply={canComment}
            />
          ))}
        </ol>
      )}

      {closed ? (
        <p className="mt-6 rounded-2xl bg-surface p-4 text-fern">{t('closed')}</p>
      ) : mode === 'disabled' ? (
        <p className="mt-6 rounded-2xl bg-surface p-4 text-fern">{t('notConfigured')}</p>
      ) : (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-surface/60 p-5"
          noValidate
        >
          <h3 className="condensed text-xl font-bold">{t('formTitle')}</h3>
          {replyTo && (
            <p className="flex items-center gap-2 text-sm text-fern">
              {t('replyingTo', { name: replyTo.authorName })}
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="font-semibold underline"
              >
                {t('cancelReply')}
              </button>
            </p>
          )}
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t('name')}
            <input
              ref={nameRef}
              name="authorName"
              required
              minLength={COMMENT_LIMITS.nameMin}
              maxLength={COMMENT_LIMITS.nameMax}
              autoComplete="nickname"
              className="field font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {t('body')}
            <textarea
              name="body"
              required
              rows={5}
              minLength={COMMENT_LIMITS.bodyMin}
              maxLength={COMMENT_LIMITS.bodyMax}
              className="field font-body font-normal"
              aria-describedby="comment-hint"
            />
            <span id="comment-hint" className="text-xs font-normal text-fern">
              {t('bodyHint', { max: COMMENT_LIMITS.bodyMax, links: COMMENT_LIMITS.maxLinks })}
            </span>
          </label>
          {/* Honeypot: hidden from people, tempting for bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              {t('honeypot')}
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn" disabled={status === 'sending'}>
              {status === 'sending' ? t('submitting') : t('submit')}
            </button>
            <p className="text-xs text-fern">{t('moderationNote')}</p>
          </div>
          {feedback && (
            <p
              role="status"
              className={`text-sm font-semibold ${status === 'PENDING' ? 'text-moss' : 'text-red-700 dark:text-red-300'}`}
            >
              {feedback}
            </p>
          )}
          {mode === 'amplify' && (
            <p className="text-[0.7rem] leading-relaxed text-fern">
              {t.rich('recaptchaNotice', {
                privacy: (chunks) => (
                  <a
                    href="https://policies.google.com/privacy"
                    className="underline"
                    rel="noopener"
                  >
                    {chunks}
                  </a>
                ),
                terms: (chunks) => (
                  <a href="https://policies.google.com/terms" className="underline" rel="noopener">
                    {chunks}
                  </a>
                ),
                policy: (chunks) => (
                  <a href={privacyHref} className="underline">
                    {chunks}
                  </a>
                ),
              })}
            </p>
          )}
        </form>
      )}
    </section>
  )
}
