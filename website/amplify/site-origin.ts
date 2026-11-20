/**
 * Where each backend's site runs, from the Amplify build environment. Sign-in callbacks, media
 * upload CORS, accepted reCAPTCHA hostnames and links in emails all follow it.
 *
 * - `main`: the production domain
 * - other branches: the branch's amplifyapp.com domain
 * - sandbox (no AWS_BRANCH): localhost
 */
export const PRODUCTION_ORIGIN = 'https://mcanvar.dev'
export const LOCAL_ORIGIN = 'http://localhost:3000'

export const isProductionBranch = process.env.AWS_BRANCH === 'main'

function dnsLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
}

export function siteOrigin(): string {
  const branch = process.env.AWS_BRANCH
  const appId = process.env.AWS_APP_ID
  if (branch === 'main') return PRODUCTION_ORIGIN
  if (branch && appId) return `https://${dnsLabel(branch)}.${appId}.amplifyapp.com`
  return LOCAL_ORIGIN
}
