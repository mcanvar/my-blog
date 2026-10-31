import { afterEach, describe, expect, it, vi } from 'vitest'
import { isAllowedHostname, verifyHuman } from './verify-human'

describe('verifyHuman', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('allows the production host, localhost and Amplify previews only', () => {
    const allowed = ['mcanvar.dev', 'localhost']
    expect(isAllowedHostname('mcanvar.dev', allowed)).toBe(true)
    expect(isAllowedHostname('v2.d1abc.amplifyapp.com', allowed)).toBe(true)
    expect(isAllowedHostname('evil.example', allowed)).toBe(false)
    expect(isAllowedHostname(undefined, allowed)).toBe(false)
  })

  it('fails closed when not configured', async () => {
    expect(await verifyHuman({ token: 't' })).toMatchObject({ ok: false, reason: 'not-configured' })
  })

  it('checks validity, action and hostname, then returns the score', async () => {
    vi.stubEnv('RECAPTCHA_PROJECT_ID', 'p')
    vi.stubEnv('RECAPTCHA_API_KEY', 'k')
    vi.stubEnv('RECAPTCHA_SITE_KEY', 's')
    vi.stubEnv('ALLOWED_HOSTNAMES', 'mcanvar.dev')
    const respond = (body: unknown) =>
      vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }))

    vi.stubGlobal(
      'fetch',
      respond({
        tokenProperties: { valid: true, action: 'comment_submit', hostname: 'mcanvar.dev' },
        riskAnalysis: { score: 0.9 },
      })
    )
    expect(await verifyHuman({ token: 't' })).toEqual({ ok: true, score: 0.9 })

    vi.stubGlobal(
      'fetch',
      respond({ tokenProperties: { valid: true, action: 'login', hostname: 'mcanvar.dev' } })
    )
    expect(await verifyHuman({ token: 't' })).toMatchObject({
      ok: false,
      reason: 'action-mismatch',
    })

    vi.stubGlobal(
      'fetch',
      respond({
        tokenProperties: { valid: true, action: 'comment_submit', hostname: 'evil.example' },
      })
    )
    expect(await verifyHuman({ token: 't' })).toMatchObject({
      ok: false,
      reason: 'hostname-mismatch',
    })

    vi.stubGlobal('fetch', respond({ tokenProperties: { valid: false, invalidReason: 'EXPIRED' } }))
    expect(await verifyHuman({ token: 't' })).toMatchObject({ ok: false, reason: 'EXPIRED' })
  })
})
