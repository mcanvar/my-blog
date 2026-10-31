import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ExternalIcon } from '@/components/icons'
import { JsonLd } from '@/components/seo/JsonLd'
import { RegisterAlternates } from '@/components/site/alternates'
import { getPostSummaries, getSiteSettings } from '@/lib/data/public'
import { formatShortDate } from '@/lib/format'
import { graph, profilePageNode } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import { postPath, staticPath } from '@/lib/seo/urls'
import type { Locale } from '@/lib/types'

export const revalidate = 300

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const locale = (await params).locale as Locale
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'Meta' }),
    getSiteSettings(),
  ])
  return buildMetadata({
    locale,
    type: 'profile',
    title: t('aboutTitle'),
    description: locale === 'tr' ? settings.bioTr : settings.bioEn,
    path: staticPath(locale, '/about'),
    languages: { tr: staticPath('tr', '/about'), en: staticPath('en', '/about') },
  })
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const locale = (await params).locale as Locale
  setRequestLocale(locale)
  const [t, settings, posts] = await Promise.all([
    getTranslations('About'),
    getSiteSettings(),
    getPostSummaries(locale),
  ])
  const bio = locale === 'tr' ? settings.bioTr : settings.bioEn

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-16">
      <RegisterAlternates
        links={{ tr: staticPath('tr', '/about'), en: staticPath('en', '/about') }}
      />
      <div className="relative overflow-hidden rounded-3xl bg-nature-dark p-8 text-nature-lighter">
        <div className="contour absolute inset-0" aria-hidden="true" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Image
            src={settings.avatarUrl}
            alt={settings.authorName}
            width={96}
            height={96}
            className="size-24 rounded-full ring-4 ring-nature-medium"
            priority
          />
          <div>
            <h1 className="condensed text-4xl font-bold text-white">{settings.authorName}</h1>
            <p className="mt-1 text-nature-light">{settings.authorJobTitle}</p>
          </div>
        </div>
        <p className="relative mt-6 font-body text-lg leading-relaxed">{bio}</p>
      </div>

      {settings.sameAs.length > 0 && (
        <section aria-labelledby="links" className="mt-10">
          <h2 id="links" className="text-xs font-bold tracking-[0.14em] text-fern uppercase">
            {t('links')}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {settings.sameAs.map((url) => (
              <li key={url}>
                <a href={url} rel="me noopener" className="btn-outline">
                  {hostLabel(url)} <ExternalIcon size={14} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {settings.knowsAbout.length > 0 && (
        <section aria-labelledby="topics" className="mt-10">
          <h2 id="topics" className="text-xs font-bold tracking-[0.14em] text-fern uppercase">
            {t('topics')}
          </h2>
          <p className="mt-3 flex flex-wrap gap-2">
            {settings.knowsAbout.map((topic) => (
              <span key={topic} className="chip text-moss">
                {topic}
              </span>
            ))}
          </p>
        </section>
      )}

      {posts.length > 0 && (
        <section aria-labelledby="latest" className="mt-10">
          <h2 id="latest" className="text-xs font-bold tracking-[0.14em] text-fern uppercase">
            {t('latest')}
          </h2>
          <ul className="mt-3 divide-y divide-dotted divide-stone">
            {posts.slice(0, 5).map((post) => (
              <li key={post.id}>
                <a
                  href={postPath(locale, post.slug)}
                  className="flex justify-between gap-4 py-3 hover:underline"
                >
                  <span className="font-semibold">{post.title}</span>
                  <time dateTime={post.publishedAt} className="shrink-0 text-sm text-fern">
                    {formatShortDate(post.publishedAt, locale)}
                  </time>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd data={graph(profilePageNode(locale, settings))} />
    </div>
  )
}
