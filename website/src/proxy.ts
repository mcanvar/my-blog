import { createServerRunner } from '@aws-amplify/adapter-nextjs'
import { fetchAuthSession } from 'aws-amplify/auth/server'
import createIntlMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { amplifyOutputs } from './lib/amplify/outputs'
import { getDataSource, isFixtureAdminAllowed } from './lib/data/source'
import { PRODUCTION_HOST } from './lib/site'

const handleI18n = createIntlMiddleware(routing)

/** Files served from the app root that must not get a locale prefix. */
const ROOT_FILES = new Set([
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
  '/llms-full.txt',
  '/manifest.webmanifest',
  '/apple-icon',
])

const MARKDOWN_PATH = /^(?:\/(en))?\/([^/]+)\.md$/

function adminCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development'
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ')
}

async function isAdmin(request: NextRequest, response: NextResponse): Promise<boolean> {
  if (isFixtureAdminAllowed()) return true
  if (getDataSource() !== 'amplify') return false
  const { runWithAmplifyServerContext } = createServerRunner({ config: amplifyOutputs })
  return runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec)
        const groups = session.tokens?.idToken?.payload['cognito:groups']
        return Array.isArray(groups) && groups.includes('ADMINS')
      } catch {
        return false
      }
    },
  })
}

async function handleAdmin(request: NextRequest): Promise<NextResponse> {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = adminCsp(nonce)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  response.headers.set('Cache-Control', 'private, no-store')

  const isLogin = request.nextUrl.pathname === '/admin/login'
  if (!isLogin && !(await isAdmin(request, response))) {
    const login = new URL('/admin/login', request.url)
    login.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(login)
  }
  return response
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin' || pathname.startsWith('/admin/')) return handleAdmin(request)
  if (ROOT_FILES.has(pathname)) return NextResponse.next()

  const indexNowKey = process.env.INDEXNOW_KEY
  if (indexNowKey && pathname === `/${indexNowKey}.txt`) {
    return NextResponse.rewrite(new URL('/api/indexnow-key', request.url))
  }

  const markdown = MARKDOWN_PATH.exec(pathname)
  if (markdown) {
    const locale = markdown[1] ?? 'tr'
    return NextResponse.rewrite(new URL(`/api/md/${locale}/${markdown[2]}`, request.url))
  }

  const response = handleI18n(request)
  const host = request.headers.get('host')?.split(':')[0]
  if (host !== PRODUCTION_HOST) response.headers.set('X-Robots-Tag', 'noindex')
  return response
}

export const config = {
  matcher: [
    // Everything except Next internals, API routes and static assets. .xml/.txt/.md/.json pass through
    // so /feed.xml, /feed.json and /<slug>.md get their locale.
    '/((?!api|_next|_vercel|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|css|js|map)$).*)',
  ],
}
