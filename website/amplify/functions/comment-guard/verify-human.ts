/**
 * reCAPTCHA (Google Cloud) score-based assessment. Kept behind one function so
 * it can be swapped for the legacy siteverify endpoint or Cloudflare Turnstile.
 */
export const RECAPTCHA_ACTION = 'comment_submit'

export interface HumanCheck {
  ok: boolean
  score: number | null
  reason?: string
}

interface Assessment {
  tokenProperties?: {
    valid?: boolean
    invalidReason?: string
    hostname?: string
    action?: string
  }
  riskAnalysis?: { score?: number }
}

export function isAllowedHostname(hostname: string | undefined, allowed: string[]): boolean {
  if (!hostname) return false
  return allowed.includes(hostname) || hostname.endsWith('.amplifyapp.com')
}

export async function verifyHuman(input: {
  token: string
  ip?: string
  userAgent?: string
}): Promise<HumanCheck> {
  const projectId = process.env.RECAPTCHA_PROJECT_ID
  const apiKey = process.env.RECAPTCHA_API_KEY
  const siteKey = process.env.RECAPTCHA_SITE_KEY
  if (!projectId || !apiKey || !siteKey) return { ok: false, score: null, reason: 'not-configured' }

  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/assessments?key=${encodeURIComponent(apiKey)}`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        event: {
          token: input.token,
          siteKey,
          expectedAction: RECAPTCHA_ACTION,
          userIpAddress: input.ip,
          userAgent: input.userAgent,
        },
      }),
      signal: AbortSignal.timeout(4000),
    })
  } catch {
    return { ok: false, score: null, reason: 'network' }
  }
  if (!response.ok) return { ok: false, score: null, reason: `http-${response.status}` }

  const assessment = (await response.json()) as Assessment
  const token = assessment.tokenProperties
  if (!token?.valid) return { ok: false, score: null, reason: token?.invalidReason ?? 'invalid' }
  if (token.action !== RECAPTCHA_ACTION)
    return { ok: false, score: null, reason: 'action-mismatch' }

  const allowed = (process.env.ALLOWED_HOSTNAMES ?? '').split(',').map((h) => h.trim())
  if (!isAllowedHostname(token.hostname, allowed)) {
    return { ok: false, score: null, reason: 'hostname-mismatch' }
  }

  return { ok: true, score: assessment.riskAnalysis?.score ?? 0 }
}
