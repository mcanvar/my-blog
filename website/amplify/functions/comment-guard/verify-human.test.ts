import { describe, expect, it, vi } from 'vitest'
import { isAllowedHostname, verifyHuman } from './verify-human'

const config = {
  projectId: 'blog-project',
  apiKey: 'AIza-test-key',
  siteKey: 'site-key',
  allowedHostnames: ['mcanvar.dev'],
}

const respond = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))

describe('verifyHuman', () => {
  it('only accepts the configured hostnames, exactly', () => {
    const allowed = ['mcanvar.dev']
    expect(isAllowedHostname('mcanvar.dev', allowed)).toBe(true)
    expect(isAllowedHostname('main.d1abc.amplifyapp.com', allowed)).toBe(false)
    expect(isAllowedHostname('localhost', allowed)).toBe(false)
    expect(isAllowedHostname('evil.mcanvar.dev', allowed)).toBe(false)
    expect(isAllowedHostname(undefined, allowed)).toBe(false)
  })

  it('sends the API key in a header, not the URL', async () => {
    const fetchImpl = respond({
      tokenProperties: { valid: true, action: 'comment_submit', hostname: 'mcanvar.dev' },
      riskAnalysis: { score: 0.9 },
    })
    await verifyHuman(config, { token: 't', ip: '203.0.113.9' }, fetchImpl)
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(
      'https://recaptchaenterprise.googleapis.com/v1/projects/blog-project/assessments'
    )
    expect(url).not.toContain('AIza')
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('AIza-test-key')
    expect(JSON.parse(String(init.body)).event).toMatchObject({
      token: 't',
      siteKey: 'site-key',
      expectedAction: 'comment_submit',
      userIpAddress: '203.0.113.9',
    })
  })

  it('checks validity, action and hostname, then returns the score', async () => {
    expect(
      await verifyHuman(
        config,
        { token: 't' },
        respond({
          tokenProperties: { valid: true, action: 'comment_submit', hostname: 'mcanvar.dev' },
          riskAnalysis: { score: 0.9 },
        })
      )
    ).toEqual({ ok: true, score: 0.9 })

    expect(
      await verifyHuman(
        config,
        { token: 't' },
        respond({ tokenProperties: { valid: true, action: 'login', hostname: 'mcanvar.dev' } })
      )
    ).toEqual({ ok: false, kind: 'rejected', reason: 'action-mismatch' })

    expect(
      await verifyHuman(
        config,
        { token: 't' },
        respond({
          tokenProperties: { valid: true, action: 'comment_submit', hostname: 'localhost' },
        })
      )
    ).toEqual({ ok: false, kind: 'rejected', reason: 'hostname-mismatch' })

    expect(
      await verifyHuman(
        config,
        { token: 't' },
        respond({ tokenProperties: { valid: false, invalidReason: 'EXPIRED' } })
      )
    ).toEqual({ ok: false, kind: 'rejected', reason: 'EXPIRED' })
  })

  it("reports Google's error status and reason, without the key", async () => {
    const check = await verifyHuman(
      config,
      { token: 't' },
      respond(
        {
          error: {
            code: 403,
            status: 'PERMISSION_DENIED',
            message: 'Permission denied on the service.',
            details: [{ reason: 'ACCESS_DENIED', metadata: { service: 'x' } }],
          },
        },
        403
      )
    )
    expect(check).toEqual({
      ok: false,
      kind: 'error',
      reason: 'http-403:PERMISSION_DENIED:ACCESS_DENIED',
    })
  })

  it('treats a network failure as an error', async () => {
    const check = await verifyHuman(
      config,
      { token: 't' },
      vi.fn().mockRejectedValue(new Error('timeout'))
    )
    expect(check).toEqual({ ok: false, kind: 'error', reason: 'network' })
  })
})
