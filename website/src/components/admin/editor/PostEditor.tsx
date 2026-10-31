'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import {
  createTranslationAction,
  deletePostAction,
  listRevisionsAction,
  renderPreviewAction,
  restoreRevisionAction,
  savePostAction,
  type SaveIntent,
} from '@/app/admin/actions/posts'
import { ArrowLeftIcon, ExternalIcon } from '@/components/icons'
import { postChecklist } from '@/lib/content/checklist'
import { resolveMediaUrl } from '@/lib/content/media'
import type { FieldErrors, PostInput } from '@/lib/content/post-schema'
import { slugify, validateSlug } from '@/lib/content/slug'
import { countWords } from '@/lib/content/stats-lite'
import { formatDateTime } from '@/lib/format'
import { uploadImage } from '@/lib/media/upload'
import type { AdminPost, Locale, PostRevision, PostStatus, TocItem } from '@/lib/types'
import { StatusBadge } from '../ui'
import { Field, inputClass, Meter, PairListField, StringListField, Toggle } from './fields'
import { RichEditor, type ImageUploader } from './RichEditor'

interface Sibling {
  id: string
  locale: Locale
  title: string
}

interface PostEditorProps {
  initial: AdminPost | null
  defaults: { locale: Locale; translationKey: string }
  siblings: Sibling[]
  mediaBaseUrl?: string
  uploadsEnabled: boolean
}

interface Draft {
  translationKey: string
  locale: Locale
  slug: string
  title: string
  seoTitle: string
  description: string
  tldr: string[]
  keyTakeaways: string[]
  content: string
  tags: string
  cover: { key: string; alt: string; width: number | null; height: number | null } | null
  faq: { q: string; a: string }[]
  sources: { title: string; url: string }[]
  publishedAt: string | null
  noindex: boolean
  canonicalUrl: string
  commentsEnabled: boolean
  needsReview: boolean
}

function toDraft(post: AdminPost | null, defaults: PostEditorProps['defaults']): Draft {
  return {
    translationKey: post?.translationKey ?? defaults.translationKey,
    locale: post?.locale ?? defaults.locale,
    slug: post?.slug ?? '',
    title: post?.title ?? '',
    seoTitle: post?.seoTitle ?? '',
    description: post?.description ?? '',
    tldr: post?.tldr ?? [],
    keyTakeaways: post?.keyTakeaways ?? [],
    content: post?.content ?? '',
    tags: post?.tags.join(', ') ?? '',
    cover: post?.cover
      ? {
          key: post.cover.key,
          alt: post.cover.alt,
          width: post.cover.width ?? null,
          height: post.cover.height ?? null,
        }
      : null,
    faq: post?.faq ?? [],
    sources: post?.sources ?? [],
    publishedAt: post?.publishedAt ?? null,
    noindex: post?.noindex ?? false,
    canonicalUrl: post?.canonicalUrl ?? '',
    commentsEnabled: post?.commentsEnabled ?? true,
    needsReview: post?.needsReview ?? false,
  }
}

function toInput(draft: Draft): PostInput {
  const clean = (list: string[]) => list.map((v) => v.trim()).filter(Boolean)
  return {
    translationKey: draft.translationKey,
    locale: draft.locale,
    slug: draft.slug.trim(),
    title: draft.title.trim(),
    seoTitle: draft.seoTitle.trim() || null,
    description: draft.description.trim(),
    tldr: clean(draft.tldr),
    keyTakeaways: clean(draft.keyTakeaways),
    content: draft.content,
    tags: [
      ...new Set(
        draft.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      ),
    ],
    cover: draft.cover?.key ? draft.cover : null,
    faq: draft.faq.filter((f) => f.q.trim() && f.a.trim()),
    sources: draft.sources.filter((s) => s.title.trim() && s.url.trim()),
    publishedAt: draft.publishedAt,
    noindex: draft.noindex,
    canonicalUrl: draft.canonicalUrl.trim() || null,
    commentsEnabled: draft.commentsEnabled,
    needsReview: draft.needsReview,
  }
}

function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null
}

function displayStatus(status: PostStatus, publishedAt: string | null): PostStatus {
  if (status === 'SCHEDULED' && publishedAt && new Date(publishedAt) <= new Date())
    return 'PUBLISHED'
  return status
}

type Tab = 'seo' | 'geo' | 'meta'
type View = 'write' | 'split' | 'preview'

export function PostEditor({
  initial,
  defaults,
  siblings,
  mediaBaseUrl,
  uploadsEnabled,
}: PostEditorProps) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial, defaults))
  const [editorKey, setEditorKey] = useState(0)
  const [meta, setMeta] = useState({
    id: initial?.id ?? null,
    updatedAt: initial?.updatedAt ?? null,
    status: (initial?.status ?? 'DRAFT') as PostStatus,
    publishedAt: initial?.publishedAt ?? null,
    legacyHtml: initial?.legacyHtml ?? null,
  })
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [slugTouched, setSlugTouched] = useState(Boolean(initial))
  const [tab, setTab] = useState<Tab>('seo')
  const [view, setView] = useState<View>('split')
  const [preview, setPreview] = useState<{ html: string; toc: TocItem[] }>({ html: '', toc: [] })
  const [revisions, setRevisions] = useState<PostRevision[] | null>(null)
  const [, startTransition] = useTransition()
  const draftRef = useRef(draft)
  useEffect(() => {
    draftRef.current = draft
  }, [draft])

  const update = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setDirty(true)
  }, [])

  const status = displayStatus(meta.status, meta.publishedAt)
  const isLiveLike = status === 'PUBLISHED' || status === 'SCHEDULED'
  const wordCount = useMemo(() => countWords(draft.content), [draft.content])
  const checklist = useMemo(
    () =>
      postChecklist({
        ...toInput(draft),
        wordCount,
        hasTranslation: siblings.length > 0,
      }),
    [draft, wordCount, siblings.length]
  )

  const save = useCallback(
    async (intent: SaveIntent, options: { silent?: boolean } = {}) => {
      const attempt = async (force: boolean): Promise<void> => {
        setSaving(true)
        if (!options.silent) setMessage(null)
        const result = await savePostAction(
          meta.id,
          toInput(draftRef.current),
          intent,
          meta.updatedAt,
          force
        )
        setSaving(false)
        if (!result.ok) {
          setErrors(result.fieldErrors ?? {})
          if (result.conflict) {
            if (window.confirm(`${result.error}\n\nOverwrite it with your version?`))
              return attempt(true)
            return
          }
          setMessage({
            kind: 'error',
            text: options.silent ? `Autosave paused: ${result.error}` : result.error,
          })
          return
        }
        setErrors({})
        setDirty(false)
        setMeta({
          id: result.post.id,
          updatedAt: result.post.updatedAt,
          status: result.post.status,
          publishedAt: result.post.publishedAt,
          legacyHtml: result.post.legacyHtml,
        })
        setDraft((d) => ({
          ...d,
          publishedAt: result.post.publishedAt,
          needsReview: result.post.needsReview,
        }))
        const labels: Record<SaveIntent, string> = {
          save: 'Saved',
          publish: 'Published',
          schedule: 'Scheduled',
          unpublish: 'Moved back to drafts',
          archive: 'Archived',
        }
        setMessage({
          kind: 'ok',
          text: `${labels[intent]} · ${formatDateTime(result.post.updatedAt, 'en')}`,
        })
        if (!meta.id) router.replace(`/admin/posts/${result.post.id}`)
        setRevisions(null)
      }
      await attempt(false)
    },
    [meta.id, meta.updatedAt, router]
  )

  // Autosave drafts (never live posts: those change only when you press Update).
  useEffect(() => {
    if (!dirty || !meta.id || meta.status !== 'DRAFT' || saving) return
    const timer = setTimeout(() => void save('save', { silent: true }), 2500)
    return () => clearTimeout(timer)
  }, [dirty, draft, meta.id, meta.status, saving, save])

  // ⌘S / Ctrl+S
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void save('save')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // Live preview rendered by the same pipeline as the public site.
  useEffect(() => {
    if (view === 'write') return
    const timer = setTimeout(() => {
      startTransition(async () => setPreview(await renderPreviewAction(draft.content)))
    }, 500)
    return () => clearTimeout(timer)
  }, [draft.content, view])

  useEffect(() => {
    if (tab !== 'meta' || !meta.id || revisions) return
    void listRevisionsAction(meta.id).then(setRevisions)
  }, [tab, meta.id, revisions])

  const uploader: ImageUploader | null = useMemo(
    () =>
      uploadsEnabled
        ? async (file) => {
            const alt =
              window.prompt('Alt text (describe the image for screen readers and search)') ?? ''
            const uploaded = await uploadImage(file, alt || draftRef.current.slug)
            return { src: uploaded.path, alt }
          }
        : null,
    [uploadsEnabled]
  )

  async function uploadCover(file: File) {
    try {
      const uploaded = await uploadImage(file, `${draft.slug || 'cover'}-cover`)
      update('cover', {
        key: uploaded.path,
        alt: draft.cover?.alt ?? '',
        width: uploaded.width,
        height: uploaded.height,
      })
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Upload failed' })
    }
  }

  async function restore(revision: PostRevision) {
    if (
      !window.confirm(
        `Restore the version from ${formatDateTime(revision.createdAt, 'en')}? Current unsaved changes are lost.`
      )
    )
      return
    const result = await restoreRevisionAction(revision.id)
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.error })
      return
    }
    setDraft(toDraft(result.post, defaults))
    setMeta((m) => ({ ...m, updatedAt: result.post.updatedAt }))
    setEditorKey((k) => k + 1)
    setDirty(false)
    setMessage({ kind: 'ok', text: 'Revision restored' })
  }

  async function remove() {
    if (!meta.id || !window.confirm('Delete this post permanently? Its revisions go too.')) return
    await deletePostAction(meta.id)
    router.replace('/admin/posts')
    router.refresh()
  }

  async function createTranslation() {
    if (!meta.id) return
    const result = await createTranslationAction(meta.id)
    if (result.ok) router.push(`/admin/posts/${result.id}`)
    else setMessage({ kind: 'error', text: result.error })
  }

  const sitePath = `${draft.locale === 'en' ? '/en' : ''}/${draft.slug}`
  const seoTitle = draft.seoTitle || draft.title
  const coverUrl = draft.cover?.key ? resolveMediaUrl(draft.cover.key, mediaBaseUrl) : null
  const gridCols =
    view === 'split'
      ? 'xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_21rem]'
      : 'xl:grid-cols-[minmax(0,1fr)_21rem]'

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-2.5 text-sm">
        <Link href="/admin/posts" className="flex items-center gap-1 text-fern hover:text-ink">
          <ArrowLeftIcon size={16} /> Posts
        </Link>
        <span className="mx-1 max-w-[18rem] truncate font-semibold">
          {draft.title || 'Untitled'}
        </span>
        <span className="inline-flex overflow-hidden rounded-md border border-line text-[0.7rem] font-bold">
          {(['tr', 'en'] as const).map((locale) => {
            const sibling = siblings.find((s) => s.locale === locale)
            if (locale === draft.locale) {
              return (
                <span key={locale} className="bg-nature-dark px-2 py-0.5 text-white">
                  {locale.toUpperCase()}
                </span>
              )
            }
            return sibling ? (
              <Link
                key={locale}
                href={`/admin/posts/${sibling.id}`}
                className="px-2 py-0.5 hover:bg-paper"
              >
                {locale.toUpperCase()}
              </Link>
            ) : (
              <button
                key={locale}
                type="button"
                disabled={!meta.id}
                onClick={createTranslation}
                className="px-2 py-0.5 text-sage hover:bg-paper"
                title="Create translation"
              >
                {locale.toUpperCase()}+
              </button>
            )
          })}
        </span>
        <StatusBadge status={status} />
        {meta.publishedAt && status === 'SCHEDULED' && (
          <span className="text-xs text-fern">for {formatDateTime(meta.publishedAt, 'en')}</span>
        )}
        <span className="text-xs text-fern" aria-live="polite">
          {saving
            ? 'Saving…'
            : dirty
              ? 'Unsaved changes'
              : message?.kind === 'ok'
                ? message.text
                : ''}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="hidden overflow-hidden rounded-md border border-line text-xs xl:inline-flex">
            {(['write', 'split', 'preview'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className="px-2 py-1 capitalize aria-pressed:bg-nature-dark aria-pressed:text-white"
              >
                {v}
              </button>
            ))}
          </span>
          {meta.id &&
            (isLiveLike && status === 'PUBLISHED' ? (
              <a href={sitePath} target="_blank" rel="noopener" className="btn-outline py-1.5">
                View <ExternalIcon size={14} />
              </a>
            ) : (
              <a
                href={`/api/draft?id=${meta.id}`}
                target="_blank"
                rel="noopener"
                className="btn-outline py-1.5"
              >
                Preview <ExternalIcon size={14} />
              </a>
            ))}
          {status === 'DRAFT' || status === 'ARCHIVED' ? (
            <>
              <button
                type="button"
                className="btn-outline py-1.5"
                disabled={saving}
                onClick={() => save('save')}
              >
                Save draft
              </button>
              <button
                type="button"
                className="btn-outline py-1.5"
                disabled={saving}
                onClick={() => {
                  setTab('meta')
                  if (!draft.publishedAt || new Date(draft.publishedAt) <= new Date()) {
                    setMessage({
                      kind: 'error',
                      text: 'Set a future publish date in the Meta tab, then press Schedule.',
                    })
                    return
                  }
                  void save('schedule')
                }}
              >
                Schedule
              </button>
              <button
                type="button"
                className="btn py-1.5"
                disabled={saving}
                onClick={() => save('publish')}
              >
                Publish
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-outline py-1.5"
                disabled={saving}
                onClick={() => save('unpublish')}
              >
                Unpublish
              </button>
              {status === 'SCHEDULED' && (
                <button
                  type="button"
                  className="btn-outline py-1.5"
                  disabled={saving}
                  onClick={() => save('publish')}
                >
                  Publish now
                </button>
              )}
              <button
                type="button"
                className="btn py-1.5"
                disabled={saving || !dirty}
                onClick={() => save('save')}
              >
                Update
              </button>
            </>
          )}
        </div>
      </header>

      {message?.kind === 'error' && (
        <p
          role="alert"
          className="border-b border-[#e6c9c9] bg-[#f6e7e7] px-4 py-2 text-sm text-[#6b2d2d]"
        >
          {message.text}
        </p>
      )}
      {draft.needsReview && (
        <p className="border-b border-[#e6d6a8] bg-[#f3ead2] px-4 py-2 text-sm text-[#7a5a12]">
          Migrated from the old blog: check the HTML → Markdown conversion, then publish (or untick
          “Needs review”).
        </p>
      )}

      <div className={`grid flex-1 grid-cols-1 ${gridCols}`}>
        {view !== 'preview' && (
          <section className="min-w-0 border-r border-line px-5 py-5 md:px-8" aria-label="Editor">
            <textarea
              value={draft.title}
              onChange={(e) => {
                const title = e.target.value.replace(/\n/g, ' ')
                update('title', title)
                if (!slugTouched) update('slug', slugify(title))
              }}
              rows={2}
              placeholder="Title"
              aria-label="Title"
              className="condensed w-full resize-none bg-transparent text-3xl leading-tight font-bold outline-none placeholder:text-sage md:text-4xl"
            />
            {errors.title && <p className="text-xs text-[#a65151]">{errors.title}</p>}
            <RichEditor
              key={editorKey}
              initialMarkdown={draft.content}
              onChange={(markdown) => update('content', markdown)}
              onUploadImage={uploader}
              mediaBaseUrl={mediaBaseUrl}
              placeholder="Start writing… type / for blocks"
            />
            <p className="mt-6 text-xs text-sage">
              {wordCount} words · ~{Math.max(1, Math.ceil(wordCount / 200))} min read
            </p>
          </section>
        )}

        {view !== 'write' && (
          <section
            className="hidden min-w-0 border-r border-line bg-paper px-6 py-6 xl:block"
            aria-label="Preview"
          >
            <p className="mb-4 text-[0.65rem] font-semibold tracking-[0.14em] text-fern uppercase">
              Live preview · same renderer as the site
            </p>
            <h1 className="condensed text-3xl leading-tight font-bold">
              {draft.title || 'Untitled'}
            </h1>
            <p className="mt-2 font-body text-fern">{draft.description}</p>
            {draft.tldr.some(Boolean) && (
              <div className="mt-5 rounded-r-xl border-l-4 border-moss bg-surface p-4">
                <p className="text-[0.65rem] font-bold tracking-[0.14em] text-moss uppercase">
                  {draft.locale === 'tr' ? 'Kısaca' : 'TL;DR'}
                </p>
                <ul className="mt-1 list-disc pl-5 font-body text-sm">
                  {draft.tldr.filter(Boolean).map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            <div
              className="article-body mt-6 text-base"
              dangerouslySetInnerHTML={{ __html: preview.html }}
            />
          </section>
        )}

        <aside className="min-w-0 bg-white" aria-label="Post settings">
          <div className="sticky top-[3.25rem] max-h-[calc(100dvh-3.25rem)] overflow-y-auto">
            <div className="flex border-b border-line text-xs font-semibold" role="tablist">
              {(['seo', 'geo', 'meta'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className="flex-1 border-b-2 border-transparent px-3 py-2.5 uppercase aria-selected:border-nature-dark aria-selected:text-nature-dark"
                >
                  {t === 'geo' ? `GEO · ${checklist.score}` : t}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 p-4">
              {tab === 'seo' && (
                <>
                  <div className="rounded-lg border border-[#e4e3dd] p-3">
                    <p className="truncate text-[0.7rem] text-fern">
                      mcanvar.dev{sitePath.replace(/\//g, ' › ').replace(/^ › /, ' › ')}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[0.95rem] leading-snug font-medium text-[#1a4f8b]">
                      {seoTitle || 'Title'}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-[#555]">
                      {draft.description || 'Meta description…'}
                    </p>
                  </div>
                  <Field
                    label="Slug"
                    error={errors.slug ?? validateSlug(draft.slug) ?? undefined}
                    hint={`URL: ${sitePath}`}
                  >
                    <input
                      value={draft.slug}
                      onChange={(e) => {
                        setSlugTouched(true)
                        update('slug', e.target.value.toLowerCase())
                      }}
                      onBlur={() => update('slug', slugify(draft.slug))}
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label="SEO title (optional)"
                    counter={{ value: seoTitle.length, min: 20, max: 60 }}
                    error={errors.seoTitle}
                    hint="Defaults to the post title."
                  >
                    <input
                      value={draft.seoTitle}
                      onChange={(e) => update('seoTitle', e.target.value)}
                      className={inputClass}
                      placeholder={draft.title}
                    />
                  </Field>
                  <Meter value={seoTitle.length} min={20} max={60} />
                  <Field
                    label="Meta description"
                    counter={{ value: draft.description.length, min: 70, max: 160 }}
                    error={errors.description}
                  >
                    <textarea
                      value={draft.description}
                      onChange={(e) => update('description', e.target.value)}
                      rows={4}
                      className={`${inputClass} resize-y`}
                    />
                  </Field>
                  <Meter value={draft.description.length} min={70} max={160} />
                  <Field
                    label="Canonical URL (optional)"
                    error={errors.canonicalUrl}
                    hint="Only if this post first appeared elsewhere."
                  >
                    <input
                      value={draft.canonicalUrl}
                      onChange={(e) => update('canonicalUrl', e.target.value)}
                      className={inputClass}
                      placeholder="https://…"
                    />
                  </Field>
                  <Toggle
                    label="Hide from search engines (noindex)"
                    checked={draft.noindex}
                    onChange={(v) => update('noindex', v)}
                  />
                  <div>
                    <p className="mb-1 text-xs font-semibold text-nature-medium">Social card</p>
                    <div className="relative flex aspect-[1200/630] flex-col justify-between overflow-hidden rounded-lg bg-gradient-to-br from-nature-darker via-nature-dark to-nature-medium p-3 text-white">
                      <span className="text-[0.6rem] text-nature-lighter">Mevlüt Canvar</span>
                      <span className="condensed line-clamp-3 text-base leading-tight font-bold">
                        {draft.title || 'Title'}
                      </span>
                      <span className="text-[0.6rem] text-nature-light">
                        mcanvar.dev · {Math.max(1, Math.ceil(wordCount / 200))} min
                      </span>
                    </div>
                  </div>
                </>
              )}

              {tab === 'geo' && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-nature-medium">
                      Readiness · {checklist.score}/100
                    </p>
                    <ul className="mt-2 flex flex-col gap-1 text-xs">
                      {checklist.items.map((item) => (
                        <li key={item.id} className={item.ok ? 'text-[#2f5130]' : 'text-[#9a6b10]'}>
                          {item.ok ? '✓' : '!'} {item.label}
                          <span className="ml-1 text-[0.6rem] text-sage uppercase">
                            {item.group}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <StringListField
                    label={draft.locale === 'tr' ? 'Kısaca (TL;DR)' : 'TL;DR'}
                    hint="Answer first: 1–3 short sentences AI engines can quote."
                    values={draft.tldr}
                    onChange={(v) => update('tldr', v)}
                    placeholder="One clear sentence"
                    max={6}
                  />
                  <StringListField
                    label="Key takeaways"
                    values={draft.keyTakeaways}
                    onChange={(v) => update('keyTakeaways', v)}
                    placeholder="A takeaway"
                    max={8}
                  />
                  <PairListField
                    label="FAQ"
                    values={draft.faq}
                    onChange={(v) => update('faq', v)}
                    fields={[
                      { key: 'q', placeholder: 'Question people ask' },
                      { key: 'a', placeholder: 'Short, direct answer', multiline: true },
                    ]}
                    empty={{ q: '', a: '' }}
                    max={12}
                  />
                  <PairListField
                    label="Sources"
                    values={draft.sources}
                    onChange={(v) => update('sources', v)}
                    fields={[
                      { key: 'title', placeholder: 'Title' },
                      { key: 'url', placeholder: 'https://…' },
                    ]}
                    empty={{ title: '', url: '' }}
                    max={30}
                  />
                  {Object.entries(errors)
                    .filter(([key]) => /^(tldr|keyTakeaways|faq|sources)/.test(key))
                    .map(([key, value]) => (
                      <p key={key} className="text-xs text-[#a65151]">
                        {key}: {value}
                      </p>
                    ))}
                </>
              )}

              {tab === 'meta' && (
                <>
                  <Field label="Language">
                    <select
                      value={draft.locale}
                      disabled={Boolean(meta.id)}
                      onChange={(e) => update('locale', e.target.value as Locale)}
                      className={inputClass}
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  </Field>
                  <Field label="Tags" hint="Comma separated, 1–5." error={errors.tags}>
                    <input
                      value={draft.tags}
                      onChange={(e) => update('tags', e.target.value)}
                      className={inputClass}
                      placeholder="aws, nextjs"
                    />
                  </Field>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-nature-medium">Cover image</p>
                    {coverUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverUrl}
                        alt={draft.cover?.alt ?? ''}
                        className="aspect-[1200/630] w-full rounded-lg object-cover"
                      />
                    )}
                    {uploadsEnabled ? (
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="text-xs"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          if (file) void uploadCover(file)
                        }}
                      />
                    ) : (
                      <input
                        value={draft.cover?.key ?? ''}
                        onChange={(e) =>
                          update(
                            'cover',
                            e.target.value
                              ? {
                                  key: e.target.value,
                                  alt: draft.cover?.alt ?? '',
                                  width: null,
                                  height: null,
                                }
                              : null
                          )
                        }
                        className={inputClass}
                        placeholder="https://… (uploads need the Amplify backend)"
                      />
                    )}
                    {draft.cover && (
                      <>
                        <input
                          value={draft.cover.alt}
                          onChange={(e) =>
                            update(
                              'cover',
                              draft.cover ? { ...draft.cover, alt: e.target.value } : null
                            )
                          }
                          className={inputClass}
                          placeholder="Alt text (required for SEO and accessibility)"
                        />
                        <button
                          type="button"
                          onClick={() => update('cover', null)}
                          className="self-start text-xs text-sage hover:text-[#a65151]"
                        >
                          Remove cover
                        </button>
                      </>
                    )}
                    {errors['cover.key'] && (
                      <p className="text-xs text-[#a65151]">{errors['cover.key']}</p>
                    )}
                  </div>
                  <Field
                    label="Publish date"
                    hint="Future date + Schedule = goes live automatically."
                    error={errors.publishedAt}
                  >
                    <input
                      type="datetime-local"
                      value={toLocalInput(draft.publishedAt)}
                      onChange={(e) => update('publishedAt', fromLocalInput(e.target.value))}
                      className={inputClass}
                    />
                  </Field>
                  <Toggle
                    label="Allow comments"
                    checked={draft.commentsEnabled}
                    onChange={(v) => update('commentsEnabled', v)}
                  />
                  <Toggle
                    label="Needs review"
                    hint="Shown for migrated posts."
                    checked={draft.needsReview}
                    onChange={(v) => update('needsReview', v)}
                  />

                  {meta.id && (
                    <div>
                      <p className="text-xs font-semibold text-nature-medium">Revisions</p>
                      {revisions === null ? (
                        <p className="mt-1 text-xs text-sage">Loading…</p>
                      ) : revisions.length === 0 ? (
                        <p className="mt-1 text-xs text-sage">Each publish stores a revision.</p>
                      ) : (
                        <ul className="mt-1 flex flex-col gap-1">
                          {revisions.map((revision) => (
                            <li
                              key={revision.id}
                              className="flex items-center justify-between gap-2 text-xs"
                            >
                              <span>
                                {formatDateTime(revision.createdAt, 'en')}
                                {revision.note && (
                                  <span className="text-sage"> · {revision.note}</span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() => restore(revision)}
                                className="font-semibold underline"
                              >
                                Restore
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {meta.legacyHtml && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-semibold text-nature-medium">
                        Original HTML (old blog)
                      </summary>
                      <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-paper p-2 whitespace-pre-wrap">
                        {meta.legacyHtml}
                      </pre>
                    </details>
                  )}

                  {meta.id && (
                    <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                      {status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          className="btn-outline py-1 text-xs"
                          onClick={() => save('archive')}
                        >
                          Archive
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-outline border-[#e6c9c9] py-1 text-xs text-[#6b2d2d]"
                        onClick={remove}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
