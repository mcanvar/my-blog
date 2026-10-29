import { defineAuth } from '@aws-amplify/backend'

/**
 * Admin-only Cognito user pool. Self sign-up is disabled in backend.ts
 * (allowAdminCreateUserOnly); create the admin user in the console and add it
 * to the ADMINS group. Visitors never sign in: they use identity pool guest access.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  multifactor: {
    mode: 'REQUIRED',
    totp: true,
  },
  accountRecovery: 'EMAIL_ONLY',
  groups: ['ADMINS'],
})
