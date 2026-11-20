export interface GuardConfig {
  recaptcha: {
    projectId: string
    apiKey: string
    siteKey: string
    allowedHostnames: string[]
  }
  ipHashSalt: string
  tables: { post: string; comment: string; settings: string; rateLimit: string }
  topicArn: string | null
  adminUrl: string
}

export type ConfigResult = { ok: true; config: GuardConfig } | { ok: false; problems: string[] }

type Env = Record<string, string | undefined>

// Google Cloud project IDs: 6-30 characters, lowercase letters, digits and hyphens.
const PROJECT_ID = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/
// Google Cloud API keys: "AIza" followed by 35 characters.
const API_KEY = /^AIza[0-9A-Za-z_-]{35}$/
// reCAPTCHA site and secret keys start with "6L"; they are a common mix-up for the two above.
const RECAPTCHA_KEY = /^6L[0-9A-Za-z_-]{38}$/

/**
 * Reads and checks the Lambda configuration once per cold start. Problems name the variable and
 * what is wrong with it, never the value.
 */
export function readConfig(env: Env): ConfigResult {
  const problems: string[] = []
  const value = (name: string) => {
    const v = env[name]?.trim()
    if (!v) problems.push(`${name} is not set`)
    return v ?? ''
  }

  const projectId = value('RECAPTCHA_PROJECT_ID')
  const apiKey = value('RECAPTCHA_API_KEY')
  const siteKey = value('RECAPTCHA_SITE_KEY')
  const ipHashSalt = value('IP_HASH_SALT')
  const post = value('POST_TABLE')
  const comment = value('COMMENT_TABLE')
  const settings = value('SETTINGS_TABLE')
  const rateLimit = value('RATE_LIMIT_TABLE')
  const adminUrl = value('ADMIN_URL')
  const allowedHostnames = (env.ALLOWED_HOSTNAMES ?? '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)

  if (projectId && !PROJECT_ID.test(projectId)) {
    problems.push(
      RECAPTCHA_KEY.test(projectId)
        ? 'RECAPTCHA_PROJECT_ID holds a reCAPTCHA key, not a Google Cloud project ID'
        : 'RECAPTCHA_PROJECT_ID is not a Google Cloud project ID'
    )
  }
  if (apiKey && !API_KEY.test(apiKey)) {
    problems.push(
      RECAPTCHA_KEY.test(apiKey)
        ? 'RECAPTCHA_API_KEY holds a reCAPTCHA key or secret, not a Google Cloud API key'
        : 'RECAPTCHA_API_KEY is not a Google Cloud API key'
    )
  }
  if (siteKey && !RECAPTCHA_KEY.test(siteKey)) {
    problems.push('RECAPTCHA_SITE_KEY is not a reCAPTCHA key')
  }
  if (ipHashSalt && ipHashSalt.length < 32) {
    problems.push('IP_HASH_SALT is shorter than 32 characters')
  }
  if (allowedHostnames.length === 0) problems.push('ALLOWED_HOSTNAMES is not set')

  if (problems.length) return { ok: false, problems }
  return {
    ok: true,
    config: {
      recaptcha: { projectId, apiKey, siteKey, allowedHostnames },
      ipHashSalt,
      tables: { post, comment, settings, rateLimit },
      topicArn: env.COMMENT_TOPIC_ARN?.trim() || null,
      adminUrl: adminUrl.replace(/\/$/, ''),
    },
  }
}
