import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GuardConfig } from './config'
import {
  clientIp,
  createCommentGuard,
  hashIp,
  submitComment,
  type GuardServices,
  type SubmitCommentEvent,
} from './guard'
import type { NewComment, ParentRecord, PostRecord, SettingsRecord } from './store'
import type { HumanCheck } from './verify-human'

const NOW = new Date('2026-11-20T12:00:00.000Z')

const config: GuardConfig = {
  recaptcha: { projectId: 'p', apiKey: 'k', siteKey: 's', allowedHostnames: ['mcanvar.dev'] },
  ipHashSalt: 'salt'.repeat(10),
  tables: { post: 'Post', comment: 'Comment', settings: 'Settings', rateLimit: 'Rate' },
  topicArn: 'arn:topic',
  adminUrl: 'https://mcanvar.dev',
}

const livePost: PostRecord = {
  id: 'post-1',
  slug: 'hello',
  locale: 'tr',
  title: 'Merhaba',
  status: 'PUBLISHED',
  publishedAt: '2026-11-01T00:00:00.000Z',
  commentsEnabled: true,
}

interface World {
  post: PostRecord | null
  settings: SettingsRecord | null
  parent: ParentRecord | null
  check: HumanCheck
  ipAllowed: boolean
  globalAllowed: boolean
}

let world: World
let stored: NewComment[]
let services: GuardServices & {
  verify: ReturnType<typeof vi.fn>
  notify: ReturnType<typeof vi.fn>
  consumeIpLimit: ReturnType<typeof vi.fn>
}
let logs: Record<string, unknown>[]
const log = (entry: Record<string, unknown>) => logs.push(entry)

function event(overrides: Partial<SubmitCommentEvent['arguments']> = {}, sourceIp?: string[]) {
  return {
    arguments: {
      postId: 'post-1',
      parentId: null,
      authorName: 'Ayşe',
      body: 'Çok faydalı bir yazı, teşekkürler.',
      recaptchaToken: 'token',
      honeypot: '',
      elapsedMs: 12_000,
      ...overrides,
    },
    identity: { sourceIp: sourceIp ?? ['203.0.113.7'] },
    request: { headers: { 'user-agent': 'test-agent' } },
  } satisfies SubmitCommentEvent
}

const submit = (e: SubmitCommentEvent) => submitComment(e, config, services, log)

beforeEach(() => {
  world = {
    post: livePost,
    settings: { authorName: 'Mevlüt Canvar', recaptchaThreshold: 0.5 },
    parent: null,
    check: { ok: true, score: 0.9 },
    ipAllowed: true,
    globalAllowed: true,
  }
  stored = []
  logs = []
  services = {
    store: {
      getPost: async () => world.post,
      getComment: async () => world.parent,
      getSettings: async () => world.settings,
      putComment: async (comment) => {
        stored.push(comment)
      },
    },
    verify: vi.fn(async () => world.check),
    consumeIpLimit: vi.fn(async () => world.ipAllowed),
    consumeGlobalLimit: async () => world.globalAllowed,
    notify: vi.fn(async () => undefined),
    now: () => NOW,
    newId: () => 'new-id',
  }
})

describe('clientIp', () => {
  it('uses the last address, which AppSync adds itself', () => {
    expect(clientIp({ sourceIp: ['1.1.1.1', '2.2.2.2', '198.51.100.4'] })).toBe('198.51.100.4')
    expect(clientIp({ sourceIp: [] })).toBe('unknown')
    expect(clientIp(null)).toBe('unknown')
  })
})

describe('submitComment', () => {
  it('stores a verified comment as PENDING and notifies without the comment text', async () => {
    expect(await submit(event())).toEqual({ ok: true, code: 'PENDING' })
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({
      status: 'PENDING',
      recaptchaScore: 0.9,
      expiresAt: null,
      ipHash: hashIp('203.0.113.7', config.ipHashSalt),
    })
    expect(services.verify).toHaveBeenCalledWith({
      token: 'token',
      ip: '203.0.113.7',
      userAgent: 'test-agent',
    })
    const [subject, message] = services.notify.mock.calls[0] as [string, string]
    expect(subject).toMatch(/^[\x20-\x7e]+$/)
    expect(message).not.toContain('Çok faydalı')
    expect(message).toContain('https://mcanvar.dev/admin/comments')
    expect(logs.at(-1)).toMatchObject({ outcome: 'stored', status: 'PENDING' })
  })

  it('rate-limits on the real client address, not a forged X-Forwarded-For', async () => {
    await submit(event({}, ['10.0.0.1', '203.0.113.7']))
    await submit(event({}, ['10.0.0.2', '203.0.113.7']))
    const keys = services.consumeIpLimit.mock.calls.map((c) => c[0])
    expect(keys[0]).toBe(keys[1])
    expect(keys[0]).toBe(hashIp('203.0.113.7', config.ipHashSalt))
  })

  it('rejects oversized or missing tokens before anything else', async () => {
    expect(await submit(event({ recaptchaToken: 'x'.repeat(5000) }))).toEqual({
      ok: false,
      code: 'INVALID',
    })
    expect(await submit(event({ recaptchaToken: '' }))).toEqual({ ok: false, code: 'INVALID' })
    expect(services.consumeIpLimit).not.toHaveBeenCalled()
    expect(services.verify).not.toHaveBeenCalled()
  })

  it('stops at the per-IP and global limits', async () => {
    world.ipAllowed = false
    expect(await submit(event())).toEqual({ ok: false, code: 'RATE_LIMITED' })
    world.ipAllowed = true
    world.globalAllowed = false
    expect(await submit(event())).toEqual({ ok: false, code: 'RATE_LIMITED' })
    expect(logs.map((l) => l.scope)).toEqual(['ip', 'global'])
    expect(services.verify).not.toHaveBeenCalled()
  })

  it('separates verification errors from rejected tokens', async () => {
    world.check = { ok: false, kind: 'error', reason: 'http-403' }
    expect(await submit(event())).toEqual({ ok: false, code: 'VERIFICATION_FAILED' })
    world.check = { ok: false, kind: 'rejected', reason: 'EXPIRED' }
    expect(await submit(event())).toEqual({ ok: false, code: 'VERIFICATION_FAILED' })
    expect(logs.map((l) => l.outcome)).toEqual(['verify_error', 'verify_rejected'])
    expect(stored).toHaveLength(0)
  })

  it('assesses the token even when a bot trap fires', async () => {
    await submit(event({ honeypot: 'http://spam.example' }))
    await submit(event({ elapsedMs: 200 }))
    expect(services.verify).toHaveBeenCalledTimes(2)
  })

  it('keeps trapped comments that pass every other check as SPAM, without email', async () => {
    expect(await submit(event({ honeypot: 'filled' }))).toEqual({ ok: true, code: 'PENDING' })
    expect(stored[0]).toMatchObject({ status: 'SPAM', expiresAt: expect.any(Number) })
    expect(services.notify).not.toHaveBeenCalled()
    expect(logs.at(-1)).toMatchObject({ outcome: 'trap_stored', trap: 'honeypot' })
  })

  it('drops trapped comments that fail other checks, still answering PENDING', async () => {
    expect(await submit(event({ elapsedMs: 10, body: 'x' }))).toEqual({ ok: true, code: 'PENDING' })
    expect(stored).toHaveLength(0)
    expect(logs.at(-1)).toMatchObject({ outcome: 'trap_dropped', trap: 'timer' })
  })

  it('stores low scores as SPAM', async () => {
    world.check = { ok: true, score: 0.1 }
    expect(await submit(event())).toEqual({ ok: true, code: 'PENDING' })
    expect(stored[0]).toMatchObject({ status: 'SPAM' })
    expect(services.notify).not.toHaveBeenCalled()
  })

  it('rejects invalid input, unpublished posts and closed comments', async () => {
    expect(await submit(event({ authorName: 'x' }))).toEqual({ ok: false, code: 'INVALID' })
    world.post = { ...livePost, status: 'DRAFT' }
    expect(await submit(event())).toEqual({ ok: false, code: 'INVALID' })
    world.post = { ...livePost, publishedAt: '2027-01-01T00:00:00.000Z' }
    expect(await submit(event())).toEqual({ ok: false, code: 'INVALID' })
    world.post = { ...livePost, commentsEnabled: false }
    expect(await submit(event())).toEqual({ ok: false, code: 'CLOSED' })
    world.post = livePost
    world.settings = { commentsAutoCloseDays: 7 }
    expect(await submit(event())).toEqual({ ok: false, code: 'CLOSED' })
    expect(stored).toHaveLength(0)
  })

  it("rejects visitors using the author's name", async () => {
    expect(await submit(event({ authorName: 'mevlut canvar' }))).toEqual({
      ok: false,
      code: 'INVALID',
    })
    expect(logs.at(-1)).toMatchObject({ outcome: 'invalid', stage: 'author-name' })
  })

  it('attaches replies to approved parents on the same post only', async () => {
    world.parent = { id: 'c1', postId: 'post-1', status: 'APPROVED', parentId: 'c0' }
    await submit(event({ parentId: 'c1' }))
    expect(stored[0]?.parentId).toBe('c0')

    world.parent = { id: 'c2', postId: 'other-post', status: 'APPROVED' }
    expect(await submit(event({ parentId: 'c2' }))).toEqual({ ok: false, code: 'INVALID' })
    world.parent = { id: 'c3', postId: 'post-1', status: 'PENDING' }
    expect(await submit(event({ parentId: 'c3' }))).toEqual({ ok: false, code: 'INVALID' })
  })
})

describe('createCommentGuard', () => {
  it('logs configuration problems and fails closed', async () => {
    const guard = createCommentGuard(
      { ok: false, problems: ['RECAPTCHA_API_KEY is not a Google Cloud API key'] },
      () => services,
      log
    )
    expect(await guard(event())).toEqual({ ok: false, code: 'ERROR' })
    expect(logs).toEqual([
      { outcome: 'config_invalid', problems: ['RECAPTCHA_API_KEY is not a Google Cloud API key'] },
    ])
    expect(services.verify).not.toHaveBeenCalled()
  })
})
