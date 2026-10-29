'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useAlternates } from './alternates'

export function LanguageSwitch({ className = '' }: { className?: string }) {
  const locale = useLocale()
  const t = useTranslations('Nav')
  const links = useAlternates()
  const other = locale === 'tr' ? 'en' : 'tr'
  const href = links?.[other] ?? (other === 'en' ? '/en' : '/')

  return (
    <a href={href} hrefLang={other} lang={other} className={className} title={t('language')}>
      <span aria-hidden="true">{t('languageShort')}</span>
      <span className="sr-only">{t('language')}</span>
    </a>
  )
}
