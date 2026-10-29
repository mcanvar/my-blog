import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  // TR lives at the root (/slug), EN under /en (/en/slug) — the original URL shape.
  localePrefix: 'as-needed',
  // Never redirect by Accept-Language: crawlers must always get the URL they asked for.
  localeDetection: false,
  alternateLinks: false,
  pathnames: {
    '/': '/',
    '/[slug]': '/[slug]',
    '/page/[page]': { tr: '/sayfa/[page]', en: '/page/[page]' },
    '/tag/[tag]': { tr: '/etiket/[tag]', en: '/tag/[tag]' },
    '/archive': { tr: '/arsiv', en: '/archive' },
    '/about': { tr: '/hakkimda', en: '/about' },
    '/privacy': { tr: '/gizlilik', en: '/privacy' },
  },
})

export type AppLocale = (typeof routing.locales)[number]
export type AppPathname = keyof typeof routing.pathnames
