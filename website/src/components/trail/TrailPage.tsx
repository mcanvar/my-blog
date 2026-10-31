import { getTranslations } from 'next-intl/server'
import { mediaBaseUrl } from '@/lib/amplify/outputs'
import { getPostPage, getPostSummaries } from '@/lib/data/public'
import { homePath, pagePath } from '@/lib/seo/urls'
import { yearMarkers } from '@/lib/trail'
import { toTrailItems } from '@/lib/trail-items'
import type { Locale } from '@/lib/types'
import { RegisterAlternates } from '../site/alternates'
import { SearchButton } from './SearchButton'
import { TrailTrack } from './TrailTrack'

export async function TrailPage({ locale, page }: { locale: Locale; page: number }) {
  const [t, all, current] = await Promise.all([
    getTranslations('Home'),
    getPostSummaries(locale),
    getPostPage(locale, page),
  ])
  const prefix = pagePath(locale, 2).replace(/2$/, '')

  return (
    <div className="flex flex-col md:h-dvh">
      <RegisterAlternates links={{ tr: pagePath('tr', 1), en: pagePath('en', 1) }} />
      <header className="flex items-end justify-between gap-4 px-4 pt-5 pb-3 md:px-6 md:pt-6">
        <div>
          <h1 className="condensed text-3xl font-bold md:text-4xl">{t('greeting')}</h1>
          <p className="mt-1 text-sm text-fern md:text-base">{t('intro', { count: all.length })}</p>
        </div>
        <SearchButton label={t('searchHint')} />
      </header>
      <TrailTrack
        key={`${locale}-${page}`}
        locale={locale}
        initialItems={toTrailItems(current.items)}
        startPage={page}
        totalPages={current.totalPages}
        total={all.length}
        years={yearMarkers(all)}
        homeHref={homePath(locale)}
        pageHrefPrefix={prefix}
        mediaBaseUrl={mediaBaseUrl}
      />
    </div>
  )
}
