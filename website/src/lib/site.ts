import type { Locale, SiteSettings } from './types'

export const PRODUCTION_HOST = 'mcanvar.dev'

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || `https://${PRODUCTION_HOST}`).replace(
  /\/$/,
  ''
)

/** Only the production host is indexable; preview branches and localhost are not. */
export const isIndexable = new URL(siteUrl).hostname === PRODUCTION_HOST

export const site = {
  name: { tr: 'Mevlüt Canvar', en: 'Mevlüt Canvar' } satisfies Record<Locale, string>,
  tagline: {
    tr: 'Yazılım, doğa ve arada kalan her şey.',
    en: 'Software, nature and everything in between.',
  } satisfies Record<Locale, string>,
  ogLocale: { tr: 'tr_TR', en: 'en_US' } satisfies Record<Locale, string>,
  htmlLang: { tr: 'tr-TR', en: 'en-US' } satisfies Record<Locale, string>,
  timeZone: 'Europe/Istanbul',
  themeColor: { light: '#ECEBE5', dark: '#252626' },
}

export const defaultSettings: SiteSettings = {
  authorName: 'Mevlüt Canvar',
  authorJobTitle: 'Software Engineer',
  bioTr: 'Yazılım geliştirici. AWS, React ve uzun yürüyüşler.',
  bioEn: 'Software engineer. AWS, React and long walks.',
  avatarUrl: 'https://secure.gravatar.com/avatar/57c8ad1723d2b40f41babd8bc20e281b?s=256&r=g',
  sameAs: [],
  knowsAbout: ['Software engineering', 'AWS', 'React', 'Next.js', 'TypeScript'],
  commentsEnabled: true,
  commentsAutoCloseDays: null,
  recaptchaThreshold: 0.5,
  blockedCrawlers: [],
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
