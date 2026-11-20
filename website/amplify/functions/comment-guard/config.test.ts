import { describe, expect, it } from 'vitest'
import { readConfig } from './config'

const valid = {
  RECAPTCHA_PROJECT_ID: 'mcanvar-blog',
  RECAPTCHA_API_KEY: `AIza${'x'.repeat(35)}`,
  RECAPTCHA_SITE_KEY: `6L${'s'.repeat(38)}`,
  IP_HASH_SALT: 'a'.repeat(64),
  POST_TABLE: 'Post-x',
  COMMENT_TABLE: 'Comment-x',
  SETTINGS_TABLE: 'SiteSettings-x',
  RATE_LIMIT_TABLE: 'RateLimit-x',
  ADMIN_URL: 'https://mcanvar.dev/',
  ALLOWED_HOSTNAMES: 'mcanvar.dev, ',
  COMMENT_TOPIC_ARN: 'arn:aws:sns:us-east-1:123456789012:t',
}

describe('readConfig', () => {
  it('accepts a complete configuration', () => {
    const result = readConfig(valid)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.config.recaptcha.allowedHostnames).toEqual(['mcanvar.dev'])
    expect(result.config.adminUrl).toBe('https://mcanvar.dev')
  })

  it('names missing variables', () => {
    const result = readConfig({ ...valid, RATE_LIMIT_TABLE: undefined, ALLOWED_HOSTNAMES: '' })
    expect(result).toEqual({
      ok: false,
      problems: ['RATE_LIMIT_TABLE is not set', 'ALLOWED_HOSTNAMES is not set'],
    })
  })

  it('catches reCAPTCHA keys pasted into the project ID and API key secrets', () => {
    const siteKey = `6L${'k'.repeat(38)}`
    const result = readConfig({
      ...valid,
      RECAPTCHA_PROJECT_ID: siteKey,
      RECAPTCHA_API_KEY: `6L${'q'.repeat(38)}`,
    })
    expect(result).toEqual({
      ok: false,
      problems: [
        'RECAPTCHA_PROJECT_ID holds a reCAPTCHA key, not a Google Cloud project ID',
        'RECAPTCHA_API_KEY holds a reCAPTCHA key or secret, not a Google Cloud API key',
      ],
    })
  })

  it('never echoes secret values', () => {
    const result = readConfig({
      ...valid,
      RECAPTCHA_API_KEY: 'super-secret-value',
      IP_HASH_SALT: 'tiny-salt',
    })
    expect(result.ok).toBe(false)
    expect(JSON.stringify(result)).not.toContain('super-secret-value')
    expect(JSON.stringify(result)).not.toContain('tiny-salt')
  })
})
