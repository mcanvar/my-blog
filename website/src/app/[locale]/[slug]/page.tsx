import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CommentsSection, type CommentsMode } from '@/components/comments/CommentsSection'
import { LeafIcon } from '@/components/icons'
import { ReadingProgress } from '@/components/post/ReadingProgress'
import { PostTools } from '@/components/post/PostTools'
import { TableOfContents } from '@/components/post/TableOfContents'
import { JsonLd } from '@/components/seo/JsonLd'
import { RegisterAlternates } from '@/components/site/alternates'
import { mediaBaseUrl } from '@/lib/amplify/outputs'
import { renderMarkdown } from '@/lib/content/markdown'
import { resolveMediaUrl } from '@/lib/content/media'
import { loadPost } from '@/lib/data/post-loader'
import {
  getAdjacentPosts,
  getApprovedComments,
  getPostSummaries,
  getRelatedPosts,
  getSiteSettings,
  getTranslations as getPostTranslations,
} from '@/lib/data/public'
import { getDataSource, isFixtureAdminAllowed } from '@/lib/data/source'
import { formatDate } from '@/lib/format'
import { blogPostingNode, breadcrumbNode, faqNode, graph } from '@/lib/seo/jsonld'
import { buildMetadata } from '@/lib/seo/metadata'
import {
  homePath,
  ogImagePath,
  postMarkdownPath,
  postPath,
  staticPath,
  tagPath,
} from '@/lib/seo/urls'
import { absoluteUrl, PRODUCTION_HOST } from '@/lib/site'
import type { Locale, Post, SiteSettings } from '@/lib/types'

export const revalidate = 60

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const posts = await getPostSummaries(params.locale as Locale)
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/[slug]'>): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params
  const locale = rawLocale as Locale
  const loaded = await loadPost(locale, decodeURIComponent(slug))
  if (!loaded) return {}
  const { post } = loaded
  const translations = await getPostTranslations(post)
  const settings = await getSiteSettings()
  return buildMetadata({
    locale,
    type: 'article',
    title: post.seoTitle || post.title,
    description: post.description,
    path: postPath(locale, post.slug),
    languages: Object.fromEntries([
      [locale, postPath(locale, post.slug)],
      ...translations.map((t) => [t.locale, postPath(t.locale, t.slug)]),
    ]),
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    tags: post.tags,
    authorName: settings.authorName,
    noindex: post.noindex || loaded.preview,
    canonicalUrl: post.canonicalUrl,
    markdownPath: postMarkdownPath(locale, post.slug),
    imagePath: ogImagePath(locale, post.slug),
  })
}

function commentsClosed(post: Post, settings: SiteSettings): boolean {
  if (!settings.commentsEnabled || !post.commentsEnabled) return true
  if (!settings.commentsAutoCloseDays) return false
  const closesAt =
    new Date(post.publishedAt).getTime() + settings.commentsAutoCloseDays * 86_400_000
  return Date.now() > closesAt
}

function commentsMode(): CommentsMode {
  if (getDataSource() === 'fixtures') return isFixtureAdminAllowed() ? 'fixtures' : 'disabled'
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? 'amplify' : 'disabled'
}

export default async function PostPage({ params }: PageProps<'/[locale]/[slug]'>) {
  const { locale: rawLocale, slug: rawSlug } = await params
  const locale = rawLocale as Locale
  setRequestLocale(locale)

  const loaded = await loadPost(locale, decodeURIComponent(rawSlug))
  if (!loaded) notFound()
  const { post, preview } = loaded

  const [t, settings, translations, adjacent, related, comments, rendered] = await Promise.all([
    getTranslations('Post'),
    getSiteSettings(),
    getPostTranslations(post),
    getAdjacentPosts(locale, post.slug),
    getRelatedPosts(post),
    getApprovedComments(post.id),
    renderMarkdown(post.content, { mediaBaseUrl, siteHost: PRODUCTION_HOST }),
  ])

  const url = absoluteUrl(postPath(locale, post.slug))
  const ogImage = absoluteUrl(ogImagePath(locale, post.slug))
  const translation = translations[0]
  const coverUrl = post.cover ? resolveMediaUrl(post.cover.key, mediaBaseUrl) : null
  const primaryTag = post.tags[0]
  const updated = post.updatedAt.slice(0, 10) !== post.publishedAt.slice(0, 10)
  const toc = [
    ...(post.tldr.length ? [{ id: 'tldr', text: t('tldr'), depth: 2 as const }] : []),
    ...rendered.toc,
    ...(post.faq.length ? [{ id: 'faq', text: t('faq'), depth: 2 as const }] : []),
    ...(post.sources.length ? [{ id: 'sources', text: t('sources'), depth: 2 as const }] : []),
  ]
  const breadcrumbs = [
    { name: t('breadcrumbHome'), path: homePath(locale) },
    ...(primaryTag ? [{ name: `#${primaryTag}`, path: tagPath(locale, primaryTag) }] : []),
    { name: post.title, path: postPath(locale, post.slug) },
  ]

  return (
    <>
      <RegisterAlternates
        links={{
          [locale]: postPath(locale, post.slug),
          ...(translation
            ? { [translation.locale]: postPath(translation.locale, translation.slug) }
            : {}),
        }}
      />
      <ReadingProgress targetId="post-body" />

      {preview && (
        <div className="flex items-center justify-between gap-3 bg-amber-100 px-4 py-2 text-sm text-amber-950 md:px-8">
          <span>{t('draftBanner')}</span>
          <a
            href={`/api/draft/disable?redirect=${encodeURIComponent(postPath(locale, post.slug))}`}
            className="font-semibold underline"
          >
            {t('exitPreview')}
          </a>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 pt-6 pb-16 md:px-8 md:pt-10">
        <nav aria-label="Breadcrumb" className="text-sm text-fern">
          <ol className="flex flex-wrap items-center gap-1.5">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.path} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">›</span>}
                {i < breadcrumbs.length - 1 ? (
                  <a href={crumb.path} className="hover:text-ink">
                    {crumb.name}
                  </a>
                ) : (
                  <span aria-current="page" className="line-clamp-1 text-ink">
                    {crumb.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <article id="post-body" lang={locale} className="max-w-[46rem] min-w-0">
            <header>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fern">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
                {updated && (
                  <>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.updatedAt}>
                      {t('updated', { date: formatDate(post.updatedAt, locale) })}
                    </time>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{t('readingTime', { minutes: post.readingMinutes })}</span>
                {translation && (
                  <a
                    href={postPath(translation.locale, translation.slug)}
                    hrefLang={translation.locale}
                    lang={translation.locale}
                    className="rounded-full bg-moss px-2.5 py-0.5 text-xs font-semibold text-paper"
                  >
                    {t('readIn')}
                  </a>
                )}
              </p>
              <h1 className="condensed mt-3 text-4xl leading-[1.02] font-bold text-balance md:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 font-body text-lg leading-relaxed text-fern">{post.description}</p>
              <div
                className={`relative mt-6 overflow-hidden rounded-2xl ${coverUrl ? 'aspect-[1200/630]' : 'h-24 md:h-32'}`}
              >
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt={post.cover?.alt || t('coverFallback')}
                    fill
                    priority
                    sizes="(min-width: 64rem) 46rem, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="contour-cover absolute inset-0" aria-hidden="true" />
                )}
              </div>
            </header>

            {post.tldr.length > 0 && (
              <aside
                id="tldr"
                aria-labelledby="tldr-title"
                className="mt-8 scroll-mt-6 rounded-r-2xl border-l-4 border-moss bg-surface p-5"
              >
                <h2
                  id="tldr-title"
                  className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-moss uppercase"
                >
                  <LeafIcon size={16} /> {t('tldr')}
                </h2>
                <ul className="mt-2 list-disc pl-5 font-body leading-relaxed">
                  {post.tldr.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </aside>
            )}

            <div
              className="article-body mt-8"
              dangerouslySetInnerHTML={{ __html: rendered.html }}
            />

            {post.keyTakeaways.length > 0 && (
              <section
                aria-labelledby="takeaways"
                className="mt-10 rounded-2xl bg-nature-dark p-6 text-nature-lighter"
              >
                <h2 id="takeaways" className="condensed text-xl font-bold text-white">
                  {t('keyTakeaways')}
                </h2>
                <ol className="mt-3 list-decimal pl-5 font-body leading-relaxed">
                  {post.keyTakeaways.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ol>
              </section>
            )}

            {post.faq.length > 0 && (
              <section id="faq" aria-labelledby="faq-title" className="mt-12 scroll-mt-6">
                <h2 id="faq-title" className="condensed text-2xl font-bold">
                  {t('faq')}
                </h2>
                <div className="mt-4 divide-y divide-line border-y border-line">
                  {post.faq.map((item) => (
                    <details key={item.q} className="group py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                        <h3>{item.q}</h3>
                        <span
                          className="text-xl text-fern transition group-open:rotate-45"
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </summary>
                      <p className="mt-2 font-body leading-relaxed text-fern">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {post.sources.length > 0 && (
              <section id="sources" aria-labelledby="sources-title" className="mt-10 scroll-mt-6">
                <h2
                  id="sources-title"
                  className="text-xs font-bold tracking-[0.14em] text-fern uppercase"
                >
                  {t('sources')}
                </h2>
                <ol className="mt-2 list-decimal pl-5 text-sm leading-relaxed">
                  {post.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        rel="noopener"
                        className="text-moss underline underline-offset-2"
                      >
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {post.tags.length > 0 && (
              <p className="mt-10 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <a
                    key={tag}
                    href={tagPath(locale, tag)}
                    className="chip text-moss hover:opacity-100"
                  >
                    #{tag}
                  </a>
                ))}
              </p>
            )}

            <aside
              className="mt-10 flex items-center gap-4 rounded-2xl bg-stone/70 p-5"
              aria-label={settings.authorName}
            >
              <Image
                src={settings.avatarUrl}
                alt=""
                width={56}
                height={56}
                className="size-14 rounded-full"
              />
              <div>
                <a href={staticPath(locale, '/about')} className="font-bold" rel="author">
                  {settings.authorName}
                </a>
                <p className="text-sm text-fern">
                  {locale === 'tr' ? settings.bioTr : settings.bioEn}
                </p>
              </div>
            </aside>

            {(adjacent.previous || adjacent.next) && (
              <nav aria-label={t('related')} className="mt-8 grid gap-3 sm:grid-cols-2">
                {adjacent.previous ? (
                  <a
                    href={postPath(locale, adjacent.previous.slug)}
                    rel="prev"
                    className="rounded-2xl bg-nature-dark p-4 text-nature-lighter transition hover:-translate-y-0.5"
                  >
                    <span className="text-xs">{t('previousStop')}</span>
                    <span className="condensed mt-1 block font-bold text-white">
                      {adjacent.previous.title}
                    </span>
                  </a>
                ) : (
                  <span />
                )}
                {adjacent.next && (
                  <a
                    href={postPath(locale, adjacent.next.slug)}
                    rel="next"
                    className="rounded-2xl bg-nature-darker p-4 text-right text-nature-lighter transition hover:-translate-y-0.5"
                  >
                    <span className="text-xs">{t('nextStop')}</span>
                    <span className="condensed mt-1 block font-bold text-white">
                      {adjacent.next.title}
                    </span>
                  </a>
                )}
              </nav>
            )}

            {related.length > 0 && (
              <section aria-labelledby="related-title" className="mt-12">
                <h2
                  id="related-title"
                  className="text-xs font-bold tracking-[0.14em] text-fern uppercase"
                >
                  {t('related')}
                </h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                  {related.map((item, i) => (
                    <li key={item.id}>
                      <a
                        href={postPath(locale, item.slug)}
                        className={`trail-card tone-${(i % 5) + 1} min-h-32 p-4`}
                      >
                        <span className="condensed relative z-10 text-base leading-tight font-bold">
                          {item.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <CommentsSection
              postId={post.id}
              comments={comments}
              mode={commentsMode()}
              closed={commentsClosed(post, settings)}
              siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              privacyHref={staticPath(locale, '/privacy')}
            />
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-8 flex flex-col gap-8">
              <TableOfContents items={toc} title={t('toc')} />
              <PostTools
                url={url}
                title={post.title}
                markdownHref={postMarkdownPath(locale, post.slug)}
                labels={{
                  copyLink: t('copyLink'),
                  copied: t('copied'),
                  viewMarkdown: t('viewMarkdown'),
                  share: t('share'),
                }}
              />
            </div>
          </aside>
        </div>
      </div>

      <JsonLd
        data={graph(
          ...[
            blogPostingNode({ post, imageUrl: ogImage, translations, comments }),
            breadcrumbNode(breadcrumbs),
            faqNode(post),
          ].filter((node) => node !== null)
        )}
      />
    </>
  )
}
