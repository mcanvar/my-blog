import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { BottomNav, Rail } from '@/components/site/Navigation'
import { SearchPalette } from '@/components/site/SearchPalette'
import { themeInitScript } from '@/components/site/ThemeToggle'
import { routing } from '@/i18n/routing'
import { getSiteSettings } from '@/lib/data/public'
import { graph, personNode, websiteNode } from '@/lib/seo/jsonld'
import { isIndexable, site, siteUrl } from '@/lib/site'
import type { Locale } from '@/lib/types'
import { fontVariables } from '../fonts'
import '@/styles/globals.css'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: site.themeColor.light },
    { media: '(prefers-color-scheme: dark)', color: site.themeColor.dark },
  ],
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  return {
    metadataBase: new URL(siteUrl),
    title: { default: site.name[locale], template: `%s · ${site.name[locale]}` },
    description: site.tagline[locale],
    applicationName: site.name[locale],
    authors: [{ name: 'Mevlüt Canvar', url: siteUrl }],
    creator: 'Mevlüt Canvar',
    formatDetection: { telephone: false, email: false, address: false },
    robots: isIndexable ? undefined : { index: false, follow: false },
    verification: {
      google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
      other: process.env.NEXT_PUBLIC_BING_VERIFICATION
        ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION }
        : undefined,
    },
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const [t, settings] = await Promise.all([getTranslations('Nav'), getSiteSettings()])
  const lang = locale as Locale

  return (
    <html
      lang={site.htmlLang[lang]}
      className={fontVariables}
      data-theme="light"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt" />
      </head>
      <body className="bg-paper text-ink">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only z-50 rounded-lg bg-accent px-4 py-2 text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {t('skip')}
          </a>
          <Rail avatarUrl={settings.avatarUrl} />
          <main id="main" className="min-h-dvh pb-bottom-nav md:pb-0 md:pl-rail">
            {children}
          </main>
          <BottomNav />
          <SearchPalette />
        </NextIntlClientProvider>
        <JsonLd data={graph(websiteNode(lang), personNode(settings, lang))} />
      </body>
    </html>
  )
}
