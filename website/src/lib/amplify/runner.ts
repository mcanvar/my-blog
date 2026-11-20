import { createServerRunner } from '@aws-amplify/adapter-nextjs'
import { amplifyOutputs, hasBackend } from './outputs'

/**
 * One Amplify server runner for Server Components, Server Actions, route handlers and the proxy.
 *
 * With AMPLIFY_APP_ORIGIN set (the site's origin, e.g. https://mcanvar.dev), the adapter runs
 * server-side auth: /api/auth/* signs in through Cognito managed login and stores the tokens in
 * HttpOnly, Secure, SameSite=Strict cookies. Browser scripts never see them.
 */
export const { runWithAmplifyServerContext, createAuthRouteHandlers } = createServerRunner({
  config: amplifyOutputs,
  // The cookies live as long as the refresh token (1 day, set in amplify/backend.ts).
  runtimeOptions: { cookies: { sameSite: 'strict', maxAge: 24 * 60 * 60 } },
})

/** Admin sign-in needs a backend with managed login (oauth outputs) and the site's origin. */
export function isServerAuthConfigured(): boolean {
  const oauth = (amplifyOutputs.auth as { oauth?: { domain?: string } } | undefined)?.oauth
  return hasBackend && Boolean(oauth?.domain) && Boolean(process.env.AMPLIFY_APP_ORIGIN)
}
