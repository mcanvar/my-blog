import { createHmac } from 'node:crypto'
import {
  COMMENT_LIMITS,
  COMMENT_PURGE_DAYS,
  commentInputSchema,
  impersonatesAuthor,
  type CommentResultCode,
} from '../../../src/lib/comments/rules'
import { isLive } from '../public-reader/queries'
import type { ConfigResult, GuardConfig } from './config'
import type { CommentStore, PostRecord, SettingsRecord } from './store'
import type { HumanCheck } from './verify-human'

export interface SubmitCommentEvent {
  arguments: {
    postId: string
    parentId?: string | null
    authorName: string
    body: string
    recaptchaToken: string
    honeypot?: string | null
    elapsedMs?: number | null
  }
  identity?: unknown
  request?: { headers?: Record<string, string | undefined> | null } | null
}

export interface SubmitCommentResult {
  ok: boolean
  code: CommentResultCode
}

export interface GuardServices {
  store: CommentStore
  verify: (input: { token: string; ip: string; userAgent?: string }) => Promise<HumanCheck>
  consumeIpLimit: (ipHash: string) => Promise<boolean>
  consumeGlobalLimit: () => Promise<boolean>
  notify: (subject: string, message: string) => Promise<void>
  now: () => Date
  newId: () => string
}

/** One JSON line per request; `outcome` drives the CloudWatch metric filter in backend.ts. */
export type GuardLog = (entry: { outcome: string } & Record<string, unknown>) => void

function result(code: CommentResultCode): SubmitCommentResult {
  return { ok: code === 'PENDING', code }
}

/**
 * AppSync appends the connecting address to any X-Forwarded-For the caller sends, so only the last
 * entry of `sourceIp` is trustworthy.
 */
export function clientIp(identity: unknown): string {
  const sourceIp = (identity as { sourceIp?: unknown } | null | undefined)?.sourceIp
  const last = Array.isArray(sourceIp) ? sourceIp[sourceIp.length - 1] : undefined
  return typeof last === 'string' && last.trim() ? last.trim() : 'unknown'
}

export function hashIp(ip: string, salt: string): string {
  return createHmac('sha256', salt).update(ip).digest('hex')
}

function commentsClosed(post: PostRecord, settings: SettingsRecord | null, now: Date): boolean {
  if (settings?.commentsEnabled === false || post.commentsEnabled === false) return true
  const days = settings?.commentsAutoCloseDays
  if (days && post.publishedAt) {
    return now.getTime() > new Date(post.publishedAt).getTime() + days * 86_400_000
  }
  return false
}

export async function submitComment(
  event: SubmitCommentEvent,
  config: GuardConfig,
  services: GuardServices,
  log: GuardLog
): Promise<SubmitCommentResult> {
  const args = event.arguments
  const token = typeof args.recaptchaToken === 'string' ? args.recaptchaToken : ''
  if (!token || token.length > COMMENT_LIMITS.tokenMax) {
    log({ outcome: 'invalid', stage: 'token' })
    return result('INVALID')
  }

  const ip = clientIp(event.identity)
  const ipHash = hashIp(ip, config.ipHashSalt)
  if (!(await services.consumeIpLimit(ipHash))) {
    log({ outcome: 'rate_limited', scope: 'ip' })
    return result('RATE_LIMITED')
  }
  if (!(await services.consumeGlobalLimit())) {
    log({ outcome: 'rate_limited', scope: 'global' })
    return result('RATE_LIMITED')
  }

  // Every token that gets past the rate limits is assessed, including ones from bots.
  const userAgent = event.request?.headers?.['user-agent'] ?? undefined
  const check = await services.verify({ token, ip, userAgent })
  if (!check.ok) {
    log({
      outcome: check.kind === 'error' ? 'verify_error' : 'verify_rejected',
      reason: check.reason,
    })
    return result('VERIFICATION_FAILED')
  }

  // Bot traps: the visitor always sees success. Comments that pass every other check are kept as
  // SPAM for 30 days, so a person caught by autofill or a very quick reply can still be approved.
  const trap = args.honeypot
    ? 'honeypot'
    : (args.elapsedMs ?? 0) < COMMENT_LIMITS.minElapsedMs
      ? 'timer'
      : null
  const reject = (
    code: CommentResultCode,
    outcome: string,
    extra: Record<string, unknown> = {}
  ) => {
    if (trap) {
      log({ outcome: 'trap_dropped', trap, reason: outcome, ...extra })
      return result('PENDING')
    }
    log({ outcome, ...extra })
    return result(code)
  }

  const parsed = commentInputSchema.safeParse(args)
  if (!parsed.success) return reject('INVALID', 'invalid', { stage: 'input' })
  const input = parsed.data

  const now = services.now()
  const [post, settings] = await Promise.all([
    services.store.getPost(input.postId),
    services.store.getSettings(),
  ])
  if (!post || !isLive(post as unknown as Record<string, unknown>, now.toISOString())) {
    return reject('INVALID', 'invalid', { stage: 'post' })
  }
  if (commentsClosed(post, settings, now)) return reject('CLOSED', 'closed')

  let parentId: string | null = null
  if (input.parentId) {
    const parent = await services.store.getComment(input.parentId)
    if (!parent || parent.postId !== post.id || parent.status !== 'APPROVED') {
      return reject('INVALID', 'invalid', { stage: 'parent' })
    }
    // One level of replies: replying to a reply attaches to its parent.
    parentId = parent.parentId ?? parent.id
  }

  if (settings?.authorName && impersonatesAuthor(input.authorName, settings.authorName)) {
    return reject('INVALID', 'invalid', { stage: 'author-name' })
  }

  const threshold = settings?.recaptchaThreshold ?? 0.5
  const status = trap || check.score < threshold ? 'SPAM' : 'PENDING'
  await services.store.putComment(
    {
      postId: post.id,
      postSlug: post.slug,
      postLocale: post.locale,
      postTitle: post.title,
      parentId,
      authorName: input.authorName,
      body: input.body,
      status,
      recaptchaScore: check.score,
      ipHash,
      expiresAt:
        status === 'SPAM' ? Math.floor(now.getTime() / 1000) + COMMENT_PURGE_DAYS * 86_400 : null,
    },
    services.newId(),
    now
  )
  log({ outcome: trap ? 'trap_stored' : 'stored', status, score: check.score, trap })

  if (status === 'PENDING') {
    // No visitor-written text in the email: it only says where to look.
    await services.notify(
      'New comment waiting for review',
      [
        `A new comment is waiting for review on "${post.title}" (${post.locale}/${post.slug}).`,
        `Length: ${input.body.length} characters. reCAPTCHA score: ${check.score.toFixed(1)}.`,
        '',
        `Review it at ${config.adminUrl}/admin/comments`,
      ].join('\n')
    )
  }

  // Spam is stored for review but the visitor sees the same response.
  return result('PENDING')
}

/** Validates the configuration once; a broken configuration is logged on every request. */
export function createCommentGuard(
  configResult: ConfigResult,
  services: (config: GuardConfig) => GuardServices,
  log: GuardLog
): (event: SubmitCommentEvent) => Promise<SubmitCommentResult> {
  if (!configResult.ok) {
    return async () => {
      log({ outcome: 'config_invalid', problems: configResult.problems })
      return result('ERROR')
    }
  }
  const { config } = configResult
  const wired = services(config)
  return (event) => submitComment(event, config, wired, log)
}
