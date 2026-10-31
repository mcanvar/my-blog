import 'server-only'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { tagSlug } from '../content/slug'
import { defaultSettings } from '../site'
import { PAGE_SIZE } from '../trail'
import type { Locale, Post, PostSummary, PublicComment, SiteSettings } from '../types'
import { fixtureStore } from './fixtures/store'
import { adminToPublic, isLive, toPost, toPublicComment, toSettings, toSummary } from './mappers'
import { getDataSource } from './source'

export const CACHE_TAGS = { posts: 'posts', comments: 'comments', settings: 'settings' } as const
const SETTINGS_ID = 'site'

function errorMessage(errors: { message: string }[] | undefined): string {
  return errors?.map((e) => e.message).join('; ') ?? 'unknown error'
}

// ---------- Amplify (guest) readers, wrapped in the Next data cache

async function amplifyPublic() {
  const [{ publicClient }, { guestContext, withThrottleRetry }] = await Promise.all([
    import('../amplify/server'),
    import('../amplify/guest'),
  ])
  return { publicClient, guestContext, withThrottleRetry }
}

const amplifySummaries = unstable_cache(
  async (locale: Locale): Promise<PostSummary[]> => {
    const { publicClient, guestContext, withThrottleRetry } = await amplifyPublic()
    const items: PostSummary[] = []
    let nextToken: string | null | undefined
    do {
      const token = nextToken
      const response = await withThrottleRetry(() =>
        publicClient.queries.listPublishedPosts(guestContext(), {
          locale,
          limit: 100,
          nextToken: token,
        })
      )
      if (response.errors?.length)
        throw new Error(`listPublishedPosts: ${errorMessage(response.errors)}`)
      for (const raw of response.data?.items ?? []) {
        const summary = toSummary(raw as Record<string, unknown>)
        if (summary) items.push(summary)
      }
      nextToken = response.data?.nextToken
    } while (nextToken)
    return items
  },
  ['post-summaries'],
  { revalidate: 120, tags: [CACHE_TAGS.posts] }
)

const amplifyPost = unstable_cache(
  async (locale: Locale, slug: string): Promise<Post | null> => {
    const { publicClient, guestContext, withThrottleRetry } = await amplifyPublic()
    const response = await withThrottleRetry(() =>
      publicClient.queries.getPublishedPost(guestContext(), { locale, slug })
    )
    if (response.errors?.length)
      throw new Error(`getPublishedPost: ${errorMessage(response.errors)}`)
    return toPost(response.data as Record<string, unknown> | null)
  },
  ['post'],
  { revalidate: 60, tags: [CACHE_TAGS.posts] }
)

const amplifyComments = unstable_cache(
  async (postId: string): Promise<PublicComment[]> => {
    const { publicClient, guestContext, withThrottleRetry } = await amplifyPublic()
    const response = await withThrottleRetry(() =>
      publicClient.queries.listApprovedComments(guestContext(), { postId })
    )
    if (response.errors?.length)
      throw new Error(`listApprovedComments: ${errorMessage(response.errors)}`)
    return (response.data ?? [])
      .map((raw) => toPublicComment(raw as Record<string, unknown>))
      .filter((c): c is PublicComment => c !== null)
  },
  ['comments'],
  { revalidate: 60, tags: [CACHE_TAGS.comments] }
)

const amplifySettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const { publicClient, guestContext, withThrottleRetry } = await amplifyPublic()
    const response = await withThrottleRetry(() =>
      publicClient.models.SiteSettings.get(guestContext(), { id: SETTINGS_ID })
    )
    if (response.errors?.length) return defaultSettings
    return toSettings(response.data as Record<string, unknown> | null)
  },
  ['site-settings'],
  { revalidate: 300, tags: [CACHE_TAGS.settings] }
)

// ---------- Fixture readers (no cache: admin edits show up immediately in dev)

function fixtureSummaries(locale: Locale): PostSummary[] {
  return fixtureStore()
    .posts.filter((p) => p.locale === locale && isLive(p))
    .map(adminToPublic)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

function fixturePost(locale: Locale, slug: string): Post | null {
  const post = fixtureStore().posts.find((p) => p.locale === locale && p.slug === slug && isLive(p))
  return post ? adminToPublic(post) : null
}

function fixtureComments(postId: string): PublicComment[] {
  return fixtureStore()
    .comments.filter((c) => c.postId === postId && c.status === 'APPROVED')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(({ id, postId: pid, parentId, authorName, body, createdAt, isAuthorReply }) => ({
      id,
      postId: pid,
      parentId,
      authorName,
      body,
      createdAt,
      isAuthorReply,
    }))
}

// ---------- Public API (deduped per render with React cache)

export const getPostSummaries = cache(async (locale: Locale): Promise<PostSummary[]> => {
  if (getDataSource() === 'fixtures') return fixtureSummaries(locale)
  return amplifySummaries(locale)
})

export const getPost = cache(async (locale: Locale, slug: string): Promise<Post | null> => {
  if (getDataSource() === 'fixtures') return fixturePost(locale, slug)
  return amplifyPost(locale, slug)
})

export const getApprovedComments = cache(async (postId: string): Promise<PublicComment[]> => {
  if (getDataSource() === 'fixtures') return fixtureComments(postId)
  return amplifyComments(postId)
})

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (getDataSource() === 'fixtures') return fixtureStore().settings
  return amplifySettings()
})

export async function getAllSummaries(): Promise<PostSummary[]> {
  const [tr, en] = await Promise.all([getPostSummaries('tr'), getPostSummaries('en')])
  return [...tr, ...en]
}

/** Other-language versions of a post (shared translationKey). */
export async function getTranslations(post: Pick<PostSummary, 'translationKey' | 'locale'>) {
  const all = await getAllSummaries()
  return all.filter((p) => p.translationKey === post.translationKey && p.locale !== post.locale)
}

export async function getPostPage(locale: Locale, page: number) {
  const all = await getPostSummaries(locale)
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  const start = (page - 1) * PAGE_SIZE
  return { items: all.slice(start, start + PAGE_SIZE), total: all.length, totalPages, page }
}

export interface TagCount {
  tag: string
  slug: string
  count: number
}

export async function getTags(locale: Locale): Promise<TagCount[]> {
  const counts = new Map<string, TagCount>()
  for (const post of await getPostSummaries(locale)) {
    for (const tag of post.tags) {
      const slug = tagSlug(tag)
      const entry = counts.get(slug) ?? { tag, slug, count: 0 }
      entry.count += 1
      counts.set(slug, entry)
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export async function getPostsByTag(locale: Locale, slug: string) {
  const posts = await getPostSummaries(locale)
  const matches = posts.filter((p) => p.tags.some((t) => tagSlug(t) === slug))
  const label = matches[0]?.tags.find((t) => tagSlug(t) === slug) ?? slug
  return { tag: label, posts: matches }
}

/** Neighbours on the trail: `previous` is older, `next` is newer. */
export async function getAdjacentPosts(locale: Locale, slug: string) {
  const posts = await getPostSummaries(locale)
  const index = posts.findIndex((p) => p.slug === slug)
  if (index === -1) return { previous: null, next: null }
  return { previous: posts[index + 1] ?? null, next: posts[index - 1] ?? null }
}

export async function getRelatedPosts(post: PostSummary, limit = 3): Promise<PostSummary[]> {
  const posts = await getPostSummaries(post.locale)
  const tags = new Set(post.tags.map(tagSlug))
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({ post: p, score: p.tags.filter((t) => tags.has(tagSlug(t))).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.post.publishedAt.localeCompare(a.post.publishedAt))
    .slice(0, limit)
    .map((x) => x.post)
}
