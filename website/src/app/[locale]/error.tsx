'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Error')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="condensed text-3xl font-bold">{t('title')}</h1>
      <button type="button" onClick={reset} className="btn">
        {t('retry')}
      </button>
    </div>
  )
}
