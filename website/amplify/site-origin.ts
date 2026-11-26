/**
 * Where each backend's site runs, from the Amplify build environment. Sign-in callbacks, media
 * upload CORS, accepted reCAPTCHA hostnames and links in emails all follow it.
 *
 * - AMPLIFY_APP_ORIGIN, when set on the branch (the production branch sets its custom domain)
 * - otherwise the branch's own amplifyapp.com domain
 * - sandbox (no AWS_BRANCH): localhost
 *
 * Nothing here names a particular site, so a fork never points at someone else's domain.
 */
export const LOCAL_ORIGIN = 'http://localhost:3000'

export const isProductionBranch = process.env.AWS_BRANCH === 'main'

function dnsLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
}

export function siteOrigin(): string {
  const configured = process.env.AMPLIFY_APP_ORIGIN?.trim()
  if (configured) return new URL(configured).origin
  const branch = process.env.AWS_BRANCH
  const appId = process.env.AWS_APP_ID
  if (branch && appId) return `https://${dnsLabel(branch)}.${appId}.amplifyapp.com`
  return LOCAL_ORIGIN
}
