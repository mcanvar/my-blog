import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const isDev = process.env.NODE_ENV === 'development'

interface Outputs {
  auth?: { aws_region?: string }
  data?: { url?: string }
  custom?: { mediaBaseUrl?: string }
}

function readOutputs(): Outputs {
  const file = join(process.cwd(), 'amplify_outputs.json')
  if (!existsSync(file)) return {}
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as Outputs
  } catch {
    return {}
  }
}

const outputs = readOutputs()
// Without a backend (fixtures builds) nothing remote is allowed for media.
const mediaHostname = outputs.custom?.mediaBaseUrl
  ? new URL(outputs.custom.mediaBaseUrl).hostname
  : 'media.invalid'

// The comment form talks to the Cognito identity pool (guest credentials), AppSync and reCAPTCHA.
const commentOrigins = [
  outputs.auth?.aws_region
    ? `https://cognito-identity.${outputs.auth.aws_region}.amazonaws.com`
    : '',
  outputs.data?.url ? new URL(outputs.data.url).origin : '',
].filter(Boolean)

// Public pages are statically generated, so they can't use nonces.
// /admin gets a strict nonce-based policy from src/proxy.ts instead.
const publicCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  ["connect-src 'self'", ...commentOrigins, 'https://www.google.com/recaptcha/'].join(' '),
  'frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
  },
]

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // OG images read these at runtime; make sure they ship with the server bundle.
  outputFileTracingIncludes: {
    '/**': ['./src/assets/fonts/**'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: mediaHostname, pathname: '/media/**' },
      { protocol: 'https', hostname: 'secure.gravatar.com', pathname: '/avatar/**' },
    ],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/((?!admin).*)',
        headers: [{ key: 'Content-Security-Policy', value: publicCsp }],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.mcanvar.dev' }],
        destination: 'https://mcanvar.dev/:path*',
        permanent: true,
      },
    ]
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withNextIntl(nextConfig)
