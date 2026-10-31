import { createHmac } from 'node:crypto'
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime'
import type { AppSyncIdentityIAM } from 'aws-lambda'
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../data/resource'
import {
  COMMENT_LIMITS,
  COMMENT_PURGE_DAYS,
  commentInputSchema,
  type CommentResultCode,
} from '../../../src/lib/comments/rules'
import { consumeRateLimit } from './rate-limit'
import { verifyHuman } from './verify-human'

type DataClientEnv = Parameters<typeof getAmplifyDataClientConfig>[0]

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(
  process.env as unknown as DataClientEnv
)
Amplify.configure(resourceConfig, libraryOptions)

const client = generateClient<Schema>({ authMode: 'iam' })
const sns = new SNSClient({})

const SETTINGS_ID = 'site'

function result(code: CommentResultCode) {
  return { ok: code === 'PENDING', code }
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT
  if (!salt) throw new Error('IP_HASH_SALT is not configured')
  return createHmac('sha256', salt).update(ip).digest('hex')
}

function purgeAt(): number {
  return Math.floor(Date.now() / 1000) + COMMENT_PURGE_DAYS * 86_400
}

async function notifyAdmin(subject: string, message: string) {
  const topicArn = process.env.COMMENT_TOPIC_ARN
  if (!topicArn) return
  try {
    await sns.send(
      new PublishCommand({ TopicArn: topicArn, Subject: subject.slice(0, 99), Message: message })
    )
  } catch (error) {
    console.error('notify failed', error)
  }
}

export const handler: Schema['submitComment']['functionHandler'] = async (event) => {
  const args = event.arguments

  // Bot traps: pretend success, store nothing.
  if (args.honeypot) return result('PENDING')
  if ((args.elapsedMs ?? 0) < COMMENT_LIMITS.minElapsedMs) return result('PENDING')

  const parsed = commentInputSchema.safeParse(args)
  if (!parsed.success) return result('INVALID')
  const input = parsed.data

  const [{ data: post }, { data: settings }] = await Promise.all([
    client.models.Post.get({ id: input.postId }),
    client.models.SiteSettings.get({ id: SETTINGS_ID }),
  ])

  const now = new Date()
  const isLive =
    (post?.status === 'PUBLISHED' || post?.status === 'SCHEDULED') &&
    !!post.publishedAt &&
    new Date(post.publishedAt) <= now
  if (!post || !isLive) return result('INVALID')
  if (settings?.commentsEnabled === false || post.commentsEnabled === false) return result('CLOSED')
  const closeDays = settings?.commentsAutoCloseDays
  if (closeDays && post.publishedAt) {
    const closesAt = new Date(post.publishedAt).getTime() + closeDays * 86_400_000
    if (now.getTime() > closesAt) return result('CLOSED')
  }

  let parentId: string | null = null
  if (input.parentId) {
    const { data: parent } = await client.models.Comment.get({ id: input.parentId })
    if (!parent || parent.postId !== post.id || parent.status !== 'APPROVED')
      return result('INVALID')
    // One level of replies: replying to a reply attaches to its parent.
    parentId = parent.parentId ?? parent.id
  }

  const identity = event.identity as AppSyncIdentityIAM | null
  const ip = identity?.sourceIp?.[0] ?? 'unknown'
  const ipHash = hashIp(ip)

  if (!(await consumeRateLimit(ipHash))) return result('RATE_LIMITED')

  const userAgent = event.request?.headers?.['user-agent']
  const check = await verifyHuman({ token: args.recaptchaToken, ip, userAgent })
  if (!check.ok) {
    console.warn('verification failed', check.reason)
    return result('VERIFICATION_FAILED')
  }

  const threshold = settings?.recaptchaThreshold ?? 0.5
  const isSpam = (check.score ?? 0) < threshold

  const { errors } = await client.models.Comment.create({
    postId: post.id,
    postSlug: post.slug,
    postLocale: post.locale,
    postTitle: post.title,
    parentId,
    authorName: input.authorName,
    body: input.body,
    status: isSpam ? 'SPAM' : 'PENDING',
    isAuthorReply: false,
    recaptchaScore: check.score,
    ipHash,
    expiresAt: isSpam ? purgeAt() : null,
  })
  if (errors?.length) {
    console.error('comment create failed', errors)
    return result('ERROR')
  }

  if (!isSpam) {
    await notifyAdmin(
      `New comment on "${post.title}"`,
      `${input.authorName} wrote on ${post.locale}/${post.slug}:\n\n${input.body.slice(0, 500)}\n\nReview: https://mcanvar.dev/admin/comments`
    )
  }

  // Spam is stored for review but the visitor sees the same response.
  return result('PENDING')
}
