import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { RegisterAlternates } from '@/components/site/alternates'
import { getPostSummaries, getTags } from '@/lib/data/public'
import { formatMonth, yearOf } from '@/lib/format'
import { breadcrumbNode, collectionPageNode, graph } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { homePath, postPath, staticPath, tagPath } from '@/lib/seo/urls'
import type { Locale, PostSummary } from '@/lib/types'

export const revalidate = 120

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/archive'>): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const t = await getTranslations({ locale, namespace: 'Meta' })
  return buildMetadata({
    locale,
    title: t('archiveTitle'),
    description: t('archiveDescription'),
    path: staticPath(locale, '/archive'),
    languages: { tr: staticPath('tr', '/archive'), en: staticPath('en', '/archive') },
  })
}

export default async function ArchivePage({ params }: PageProps<'/[locale]/archive'>) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const [t, tMeta, tPost, posts, tags] = await Promise.all([
    getTranslations('Archive'),
    getTranslations('Meta'),
    getTranslations('Trail'),
    getPostSummaries(locale),
    getTags(locale),
  ])

  const byYear = new Map<number, PostSummary[]>()
  for (const post of posts) {
    const year = yearOf(post.publishedAt)
    byYear.set(year, [...(byYear.get(year) ?? []), post])
  }
  const path = staticPath(locale, '/archive')

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-14">
      <RegisterAlternates
        links={{ tr: staticPath('tr', '/archive'), en: staticPath('en', '/archive') }}
      />
      <h1 className="condensed text-4xl font-bold md:text-5xl">{t('title')}</h1>
      <p className="mt-2 text-fern">{t('intro', { count: posts.length })}</p>

      <div className="mt-10 flex flex-col gap-10">
        {[...byYear.entries()].map(([year, list]) => (
          <section
            key={year}
            aria-labelledby={`year-${year}`}
            className="grid gap-4 md:grid-cols-[6rem_1fr]"
          >
            <h2
              id={`year-${year}`}
              className="condensed text-4xl leading-none font-bold text-sage md:sticky md:top-8 md:self-start"
            >
              {year}
            </h2>
            <ul className="divide-y divide-dotted divide-stone">
              {list.map((post) => (
                <li key={post.id}>
                  <a
                    href={postPath(locale, post.slug)}
                    className="group flex items-baseline justify-between gap-4 py-3"
                  >
                    <span>
                      <span className="block font-semibold group-hover:underline">
                        {post.title}
                      </span>
                      <span className="mt-0.5 line-clamp-1 font-body text-sm text-fern">
                        {post.description}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-fern tabular-nums">
                      <time dateTime={post.publishedAt}>
                        {formatMonth(post.publishedAt, locale)}
                      </time>
                      <span className="block">
                        {tPost('minutes', { minutes: post.readingMinutes })}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {tags.length > 0 && (
        <section id="tags" aria-labelledby="tags-title" className="mt-16 scroll-mt-8">
          <h2 id="tags-title" className="condensed text-2xl font-bold">
            {t('tags')}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.slug}>
                <a
                  href={tagPath(locale, tag.tag)}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm hover:border-sage"
                >
                  #{tag.tag}
                  <span className="text-xs text-fern">{tag.count}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd
        data={graph(
          collectionPageNode({
            locale,
            name: tMeta('archiveTitle'),
            description: tMeta('archiveDescription'),
            path,
            posts,
          }),
          breadcrumbNode([
            { name: locale === 'tr' ? 'Patika' : 'Trail', path: homePath(locale) },
            { name: tMeta('archiveTitle'), path },
          ])
        )}
      />
    </div>
  )
}
