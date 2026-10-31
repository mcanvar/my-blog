import { getLocale, getTranslations } from 'next-intl/server'
import { NotFoundContent } from '@/components/site/NotFoundContent'
import { homePath, staticPath } from '@/lib/seo/urls'
import type { Locale } from '@/lib/types'

export default async function LocaleNotFound() {
  const locale = (await getLocale()) as Locale
  const t = await getTranslations('NotFound')
  return (
    <NotFoundContent
      title={t('title')}
      body={t('body')}
      homeHref={homePath(locale)}
      homeLabel={t('home')}
      archiveHref={staticPath(locale, '/archive')}
      archiveLabel={t('archive')}
    />
  )
}
