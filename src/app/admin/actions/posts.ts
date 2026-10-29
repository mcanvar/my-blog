'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { renderMarkdown, type RenderedMarkdown } from '@/lib/content/markdown'
import {
  fieldErrors,
  postInputSchema,
  type FieldErrors,
  type PostInput,
} from '@/lib/content/post-schema'
import { slugify } from '@/lib/content/slug'
import { contentStats } from '@/lib/content/stats'
import { mediaBaseUrl } from '@/lib/amplify/outputs'
import { adminRepository, type PostWrite } from '@/lib/data/admin'
import { isLive } from '@/lib/data/mappers'
import { CACHE_TAGS } from '@/lib/data/public'
import { pingIndexNow } from '@/lib/geo/indexnow'
import { feedPath, homePath, postPath, staticPath, tagPath } from '@/lib/seo/urls'
import { absoluteUrl, PRODUCTION_HOST } from '@/lib/site'
import type { AdminPost, PostRevision } from '@/lib/types'

export type SaveIntent = 'save' | 'publish' | 'schedule' | 'unpublish' | 'archive'

export type SaveResult =
  | { ok: true; post: AdminPost }
  | { ok: false; error: string; fieldErrors?: FieldErrors; conflict?: boolean }

function revalidatePublicPaths(posts: AdminPost[]) {
  revalidateTag(CACHE_TAGS.posts, 'max')
  for (const post of posts) {
    revalidatePath(postPath(post.locale, post.slug))
    revalidatePath(homePath(post.locale))
    revalidatePath(staticPath(post.locale, '/archive'))
    revalidatePath(feedPath(post.locale, 'xml'))
    for (const tag of post.tags) revalidatePath(tagPath(post.locale, tag))
  }
  revalidatePath('/sitemap.xml')
  revalidatePath('/llms.txt')
}

function nextStatus(intent: SaveIntent, current: AdminPost | null, publishedAt: string | null) {
  const now = new Date()
  switch (intent) {
    case 'publish':
      return {
        status: 'PUBLISHED' as const,
        publishedAt: publishedAt && new Date(publishedAt) <= now ? publishedAt : now.toISOString(),
      }
    case 'schedule':
      if (!publishedAt || new Date(publishedAt) <= now) return null
      return { status: 'SCHEDULED' as const, publishedAt }
    case 'unpublish':
      return { status: 'DRAFT' as const, publishedAt: current?.publishedAt ?? null }
    case 'archive':
      return { status: 'ARCHIVED' as const, publishedAt: current?.publishedAt ?? null }
    default:
      return {
        status: current?.status ?? ('DRAFT' as const),
        publishedAt: publishedAt ?? current?.publishedAt ?? null,
      }
  }
}

export async function savePostAction(
  id: string | null,
  input: PostInput,
  intent: SaveIntent,
  expectedUpdatedAt: string | null,
  force = false
): Promise<SaveResult> {
  await requireAdmin()
  const parsed = postInputSchema.safeParse(input)
  if (!parsed.success)
    return {
      ok: false,
      error: 'Please fix the highlighted fields.',
      fieldErrors: fieldErrors(parsed.error),
    }
  const data = parsed.data
  const repo = await adminRepository()

  const current = id ? await repo.getPost(id) : null
  if (id && !current) return { ok: false, error: 'This post no longer exists.' }
  if (current && expectedUpdatedAt && current.updatedAt !== expectedUpdatedAt && !force) {
    return {
      ok: false,
      conflict: true,
      error: 'This post was changed somewhere else since you opened it.',
    }
  }

  const duplicates = (await repo.findPostsBySlug(data.locale, data.slug)).filter((p) => p.id !== id)
  if (duplicates.length) {
    return {
      ok: false,
      error: 'Slug already in use.',
      fieldErrors: { slug: `Another ${data.locale.toUpperCase()} post uses this slug.` },
    }
  }

  const status = nextStatus(intent, current, data.publishedAt)
  if (!status)
    return {
      ok: false,
      error: 'Pick a future date to schedule.',
      fieldErrors: { publishedAt: 'Pick a date in the future.' },
    }

  const stats = contentStats(data.content)
  const write: PostWrite = {
    ...data,
    cover: data.cover
      ? {
          key: data.cover.key,
          alt: data.cover.alt,
          width: data.cover.width ?? null,
          height: data.cover.height ?? null,
        }
      : null,
    status: status.status,
    publishedAt: status.publishedAt,
    needsReview: intent === 'publish' ? false : data.needsReview,
    legacyHtml: current?.legacyHtml ?? null,
    readingMinutes: stats.readingMinutes,
    wordCount: stats.wordCount,
  }

  const saved = current ? await repo.updatePost(current.id, write) : await repo.createPost(write)

  const becameVisible = isLive(saved)
  const wasVisible = current ? isLive(current) : false
  if (intent !== 'save' || becameVisible || wasVisible) {
    if (intent === 'publish' || intent === 'schedule' || (intent === 'save' && becameVisible)) {
      await repo.createRevision(saved, intent)
    }
    revalidatePublicPaths(current && current.slug !== saved.slug ? [current, saved] : [saved])
    if (becameVisible) await pingIndexNow([absoluteUrl(postPath(saved.locale, saved.slug))])
  }

  return { ok: true, post: saved }
}

export async function deletePostAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin()
  const repo = await adminRepository()
  const post = await repo.getPost(id)
  if (!post) return { ok: true }
  await repo.deletePost(id)
  revalidatePublicPaths([post])
  return { ok: true }
}

export async function createTranslationAction(
  sourceId: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdmin()
  const repo = await adminRepository()
  const source = await repo.getPost(sourceId)
  if (!source) return { ok: false, error: 'Source post not found.' }
  const locale = source.locale === 'tr' ? 'en' : 'tr'
  const all = await repo.listPosts()
  const existing = all.find(
    (p) => p.translationKey === source.translationKey && p.locale === locale
  )
  if (existing) return { ok: true, id: existing.id }

  let slug = slugify(`${source.slug}-${locale}`)
  if ((await repo.findPostsBySlug(locale, slug)).length) slug = `${slug}-${Date.now().toString(36)}`
  const created = await repo.createPost({
    ...source,
    locale,
    slug,
    status: 'DRAFT',
    publishedAt: null,
    needsReview: true,
    legacyHtml: null,
  })
  return { ok: true, id: created.id }
}

export async function renderPreviewAction(markdown: string): Promise<RenderedMarkdown> {
  await requireAdmin()
  return renderMarkdown(markdown.slice(0, 200_000), { mediaBaseUrl, siteHost: PRODUCTION_HOST })
}

export async function listRevisionsAction(postId: string): Promise<PostRevision[]> {
  await requireAdmin()
  return (await adminRepository()).listRevisions(postId)
}

export async function restoreRevisionAction(revisionId: string): Promise<SaveResult> {
  await requireAdmin()
  const repo = await adminRepository()
  const revision = await repo.getRevision(revisionId)
  if (!revision) return { ok: false, error: 'Revision not found.' }
  const current = await repo.getPost(revision.postId)
  if (!current) return { ok: false, error: 'Post not found.' }
  const { id: _id, createdAt: _c, updatedAt: _u, ...snapshot } = revision.snapshot
  // Content comes back; status and dates stay as they are now.
  const saved = await repo.updatePost(current.id, {
    ...snapshot,
    status: current.status,
    publishedAt: current.publishedAt,
  })
  if (isLive(saved)) revalidatePublicPaths([saved])
  return { ok: true, post: saved }
}
