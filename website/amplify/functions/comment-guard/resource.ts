import { defineFunction, secret } from '@aws-amplify/backend'

/**
 * Handles `submitComment`: validation, reCAPTCHA assessment, rate limiting,
 * stores the comment as PENDING and notifies the admin. All keys are Amplify
 * secrets (SSM SecureString), resolved at runtime — never in the repo.
 */
export const commentGuard = defineFunction({
  name: 'comment-guard',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 10,
  memoryMB: 512,
  // Used as a data handler and also calls the data API: keep it in the data stack.
  resourceGroupName: 'data',
  environment: {
    RECAPTCHA_SITE_KEY: secret('RECAPTCHA_SITE_KEY'),
    RECAPTCHA_PROJECT_ID: secret('RECAPTCHA_PROJECT_ID'),
    RECAPTCHA_API_KEY: secret('RECAPTCHA_API_KEY'),
    IP_HASH_SALT: secret('IP_HASH_SALT'),
    ALLOWED_HOSTNAMES: 'mcanvar.dev,www.mcanvar.dev,localhost',
  },
})
