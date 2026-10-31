import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const isDev = process.env.NODE_ENV === 'development'

function mediaHostname(): string {
  const file = join(process.cwd(), 'amplify_outputs.json')
  if (!existsSync(file)) return '*.cloudfront.net'
  try {
    const outputs = JSON.parse(readFileSync(file, 'utf8')) as { custom?: { mediaBaseUrl?: string } }
    return outputs.custom?.mediaBaseUrl
      ? new URL(outputs.custom.mediaBaseUrl).hostname
      : '*.cloudfront.net'
  } catch {
    return '*.cloudfront.net'
  }
}

// Public pages are statically generated, so they can't use nonces.
// /admin gets a strict nonce-based policy from src/proxy.ts instead.
const publicCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.google.com https://www.gstatic.com https://www.recaptcha.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com https://www.google.com https://www.recaptcha.net",
  'frame-src https://www.google.com https://recaptcha.google.com https://www.recaptcha.net',
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
      { protocol: 'https', hostname: mediaHostname() },
      { protocol: 'https', hostname: 'secure.gravatar.com' },
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
