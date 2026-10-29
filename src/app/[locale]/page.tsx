import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { TrailPage } from '@/components/trail/TrailPage'
import { getPostSummaries } from '@/lib/data/public'
import { buildMetadata } from '@/lib/seo/metadata'
import { blogNode, graph } from '@/lib/seo/jsonld'
import { homePath } from '@/lib/seo/urls'
import type { Locale } from '@/lib/types'

export const revalidate = 120

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const t = await getTranslations({ locale, namespace: 'Meta' })
  return buildMetadata({
    locale,
    title: t('homeTitle'),
    description: t('homeDescription'),
    path: homePath(locale),
    languages: { tr: homePath('tr'), en: homePath('en') },
    absoluteTitle: true,
  })
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const posts = await getPostSummaries(locale)

  return (
    <>
      <TrailPage locale={locale} page={1} />
      <JsonLd data={graph(blogNode(locale, posts))} />
    </>
  )
}
