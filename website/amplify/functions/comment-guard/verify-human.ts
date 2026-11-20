/**
 * reCAPTCHA (Google Cloud) score-based assessment. Kept behind one function so
 * it can be swapped for the legacy siteverify endpoint or Cloudflare Turnstile.
 */
import type { GuardConfig } from './config'

export const RECAPTCHA_ACTION = 'comment_submit'

/**
 * `rejected`: Google answered and the token is not acceptable (bots end up here).
 * `error`: the check itself failed (configuration, quota, network) and needs attention.
 */
export type HumanCheck =
  { ok: true; score: number } | { ok: false; kind: 'rejected' | 'error'; reason: string }

interface Assessment {
  tokenProperties?: {
    valid?: boolean
    invalidReason?: string
    hostname?: string
    action?: string
  }
  riskAnalysis?: { score?: number }
}

interface GoogleError {
  error?: { status?: string; details?: { reason?: string }[] }
}

export function isAllowedHostname(hostname: string | undefined, allowed: string[]): boolean {
  return !!hostname && allowed.includes(hostname)
}

async function errorReason(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as GoogleError
    const reason = body.error?.details?.find((d) => d.reason)?.reason
    return [`http-${response.status}`, body.error?.status, reason].filter(Boolean).join(':')
  } catch {
    return `http-${response.status}`
  }
}

export async function verifyHuman(
  config: GuardConfig['recaptcha'],
  input: { token: string; ip?: string; userAgent?: string },
  fetchImpl: typeof fetch = fetch
): Promise<HumanCheck> {
  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(
    config.projectId
  )}/assessments`

  let response: Response
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      // In a header rather than the URL, so the key can't end up in a logged URL.
      headers: { 'content-type': 'application/json', 'x-goog-api-key': config.apiKey },
      body: JSON.stringify({
        event: {
          token: input.token,
          siteKey: config.siteKey,
          expectedAction: RECAPTCHA_ACTION,
          userIpAddress: input.ip,
          userAgent: input.userAgent,
        },
      }),
      signal: AbortSignal.timeout(4000),
    })
  } catch {
    return { ok: false, kind: 'error', reason: 'network' }
  }
  if (!response.ok) return { ok: false, kind: 'error', reason: await errorReason(response) }

  const assessment = (await response.json()) as Assessment
  const token = assessment.tokenProperties
  if (!token?.valid) {
    return { ok: false, kind: 'rejected', reason: token?.invalidReason ?? 'invalid' }
  }
  if (token.action !== RECAPTCHA_ACTION) {
    return { ok: false, kind: 'rejected', reason: 'action-mismatch' }
  }
  if (!isAllowedHostname(token.hostname, config.allowedHostnames)) {
    return { ok: false, kind: 'rejected', reason: 'hostname-mismatch' }
  }
  return { ok: true, score: assessment.riskAnalysis?.score ?? 0 }
}
