import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { TrailPage } from '@/components/trail/TrailPage'
import { routing } from '@/i18n/routing'
import { getPostPage } from '@/lib/data/public'
import { buildMetadata } from '@/lib/seo/metadata'
import { collectionPageNode, graph } from '@/lib/seo/jsonld'
import { homePath, pagePath } from '@/lib/seo/urls'
import type { Locale } from '@/lib/types'

export const revalidate = 120

export async function generateStaticParams() {
  const params: { locale: string; page: string }[] = []
  for (const locale of routing.locales) {
    const { totalPages } = await getPostPage(locale, 1)
    for (let page = 2; page <= totalPages; page++) params.push({ locale, page: String(page) })
  }
  return params
}

function parsePage(value: string): number | null {
  return /^\d+$/.test(value) ? Number(value) : null
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/page/[page]'>): Promise<Metadata> {
  const { locale: rawLocale, page: rawPage } = await params
  const locale = rawLocale as Locale
  const page = parsePage(rawPage) ?? 1
  const t = await getTranslations({ locale, namespace: 'Meta' })
  return buildMetadata({
    locale,
    title: `${t('pageTitle', { page })}`,
    description: t('homeDescription'),
    path: pagePath(locale, page),
  })
}

export default async function PaginatedTrail({ params }: PageProps<'/[locale]/page/[page]'>) {
  const { locale: rawLocale, page: rawPage } = await params
  const locale = rawLocale as Locale
  setRequestLocale(locale)

  const page = parsePage(rawPage)
  if (page === null) notFound()
  if (page === 1) permanentRedirect(homePath(locale))

  const current = await getPostPage(locale, page)
  if (page > current.totalPages) notFound()
  const t = await getTranslations({ locale, namespace: 'Meta' })

  return (
    <>
      <TrailPage locale={locale} page={page} />
      <JsonLd
        data={graph(
          collectionPageNode({
            locale,
            name: t('pageTitle', { page }),
            description: t('homeDescription'),
            path: pagePath(locale, page),
            posts: current.items,
          })
        )}
      />
    </>
  )
}
