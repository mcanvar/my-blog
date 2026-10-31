import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { RegisterAlternates } from '@/components/site/alternates'
import { TrailTrack } from '@/components/trail/TrailTrack'
import { mediaBaseUrl } from '@/lib/amplify/outputs'
import { getPostsByTag, getTags } from '@/lib/data/public'
import { breadcrumbNode, collectionPageNode, graph } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { homePath, staticPath, tagPath } from '@/lib/seo/urls'
import { yearMarkers } from '@/lib/trail'
import { toTrailItems } from '@/lib/trail-items'
import type { Locale } from '@/lib/types'

export const revalidate = 120

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const tags = await getTags(params.locale as Locale)
  return tags.map((tag) => ({ tag: tag.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/tag/[tag]'>): Promise<Metadata> {
  const { locale: rawLocale, tag: slug } = await params
  const locale = rawLocale as Locale
  const { tag, posts } = await getPostsByTag(locale, decodeURIComponent(slug))
  if (!posts.length) return {}
  const t = await getTranslations({ locale, namespace: 'Meta' })
  return buildMetadata({
    locale,
    title: t('tagTitle', { tag }),
    description: t('tagDescription', { tag, count: posts.length }),
    path: tagPath(locale, tag),
  })
}

export default async function TagPage({ params }: PageProps<'/[locale]/tag/[tag]'>) {
  const { locale: rawLocale, tag: slug } = await params
  const locale = rawLocale as Locale
  setRequestLocale(locale)
  const { tag, posts } = await getPostsByTag(locale, decodeURIComponent(slug))
  if (!posts.length) notFound()
  const [t, tMeta] = await Promise.all([getTranslations('Tags'), getTranslations('Meta')])
  const path = tagPath(locale, tag)

  return (
    <div className="flex flex-col md:h-dvh">
      <RegisterAlternates
        links={{ tr: staticPath('tr', '/archive'), en: staticPath('en', '/archive') }}
      />
      <header className="flex items-end justify-between gap-4 px-4 pt-5 pb-3 md:px-6 md:pt-6">
        <div>
          <h1 className="condensed text-3xl font-bold md:text-4xl">{t('title', { tag })}</h1>
          <p className="mt-1 text-sm text-fern">{t('intro', { count: posts.length })}</p>
        </div>
        <a href={`${staticPath(locale, '/archive')}#tags`} className="btn-outline">
          {t('all')}
        </a>
      </header>
      <TrailTrack
        locale={locale}
        initialItems={toTrailItems(posts)}
        startPage={1}
        totalPages={1}
        total={posts.length}
        years={yearMarkers(posts)}
        homeHref={path}
        pageHrefPrefix={path}
        mediaBaseUrl={mediaBaseUrl}
        paginate={false}
      />
      <JsonLd
        data={graph(
          collectionPageNode({
            locale,
            name: tMeta('tagTitle', { tag }),
            description: tMeta('tagDescription', { tag, count: posts.length }),
            path,
            posts,
          }),
          breadcrumbNode([
            { name: locale === 'tr' ? 'Patika' : 'Trail', path: homePath(locale) },
            { name: `#${tag}`, path },
          ])
        )}
      />
    </div>
  )
}
