import { defineAuth } from '@aws-amplify/backend'
import { siteOrigin } from '../site-origin'

const origin = siteOrigin()

/**
 * Admin-only Cognito user pool. Self sign-up is disabled in backend.ts
 * (allowAdminCreateUserOnly); create the admin user in the console and add it
 * to the ADMINS group. Visitors never sign in: they use identity pool guest access.
 *
 * Admins sign in on Cognito's managed login pages. /api/auth/* exchanges the code on the server
 * and keeps the tokens in HttpOnly cookies, so no script in the browser can read them.
 * Amplify derives the Cognito domain prefix from a hash of the backend, unique per branch.
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      callbackUrls: [`${origin}/api/auth/sign-in-callback`],
      logoutUrls: [`${origin}/api/auth/sign-out-callback`],
      scopes: ['OPENID', 'EMAIL'],
    },
  },
  multifactor: {
    mode: 'REQUIRED',
    totp: true,
  },
  accountRecovery: 'EMAIL_ONLY',
  groups: ['ADMINS'],
})
