import 'server-only'
import { adminClient } from '../../amplify/server'
import type { AdminPost, PostRevision, SiteSettings } from '../../types'
import { toAdminComment, toAdminPost, toSettings } from '../mappers'
import type { AdminRepository, PostWrite } from './repository'

const SETTINGS_ID = 'site'

type Result<T> = { data: T; errors?: { message: string }[] | null; nextToken?: string | null }

function unwrap<T>(result: Result<T>, label: string): T {
  if (result.errors?.length) {
    throw new Error(`${label}: ${result.errors.map((e) => e.message).join('; ')}`)
  }
  return result.data
}

async function collect<T>(
  label: string,
  page: (nextToken: string | null | undefined) => Promise<Result<T[]>>
): Promise<T[]> {
  const items: T[] = []
  let nextToken: string | null | undefined
  do {
    const result = await page(nextToken)
    items.push(...unwrap(result, label))
    nextToken = result.nextToken
  } while (nextToken)
  return items
}

function toPostInput(input: PostWrite) {
  return {
    translationKey: input.translationKey,
    locale: input.locale,
    slug: input.slug,
    title: input.title,
    seoTitle: input.seoTitle,
    description: input.description,
    tldr: input.tldr,
    keyTakeaways: input.keyTakeaways,
    content: input.content,
    legacyHtml: input.legacyHtml,
    status: input.status,
    needsReview: input.needsReview,
    publishedAt: input.publishedAt,
    tags: input.tags,
    cover: input.cover
      ? {
          key: input.cover.key,
          alt: input.cover.alt,
          width: input.cover.width,
          height: input.cover.height,
        }
      : null,
    faq: input.faq,
    sources: input.sources,
    readingMinutes: input.readingMinutes,
    wordCount: input.wordCount,
    noindex: input.noindex,
    canonicalUrl: input.canonicalUrl,
    commentsEnabled: input.commentsEnabled,
  }
}

function parseSnapshot(value: unknown): AdminPost | null {
  const raw = typeof value === 'string' ? (JSON.parse(value) as unknown) : value
  return toAdminPost(raw as Record<string, unknown>)
}

function mustPost(raw: unknown, label: string): AdminPost {
  const post = toAdminPost(raw as Record<string, unknown> | null)
  if (!post) throw new Error(`${label}: no data returned`)
  return post
}

export const amplifyRepository: AdminRepository = {
  async listPosts() {
    const client = adminClient()
    const rows = await collect('listPosts', (nextToken) =>
      client.models.Post.list({ limit: 200, nextToken })
    )
    return rows
      .map((r) => toAdminPost(r as unknown as Record<string, unknown>))
      .filter((p): p is AdminPost => p !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },
  async getPost(id) {
    const result = await adminClient().models.Post.get({ id })
    return toAdminPost(unwrap(result, 'getPost') as unknown as Record<string, unknown> | null)
  },
  async findPostsBySlug(locale, slug) {
    const result = await adminClient().models.Post.listPostsBySlug({ slug, locale: { eq: locale } })
    return unwrap(result, 'listPostsBySlug')
      .map((r) => toAdminPost(r as unknown as Record<string, unknown>))
      .filter((p): p is AdminPost => p !== null)
  },
  async createPost(input) {
    const result = await adminClient().models.Post.create(toPostInput(input))
    return mustPost(unwrap(result, 'createPost'), 'createPost')
  },
  async updatePost(id, input) {
    const result = await adminClient().models.Post.update({ id, ...toPostInput(input) })
    return mustPost(unwrap(result, 'updatePost'), 'updatePost')
  },
  async deletePost(id) {
    const client = adminClient()
    const revisions = await collect('listRevisions', (nextToken) =>
      client.models.PostRevision.listRevisionsByPost(
        { postId: id },
        { nextToken, selectionSet: ['id'] }
      )
    )
    await Promise.all(revisions.map((r) => client.models.PostRevision.delete({ id: r.id })))
    unwrap(await client.models.Post.delete({ id }), 'deletePost')
  },

  async listRevisions(postId) {
    const result = await adminClient().models.PostRevision.listRevisionsByPost(
      { postId },
      { sortDirection: 'DESC', limit: 50 }
    )
    return unwrap(result, 'listRevisions')
      .map((r): PostRevision | null => {
        const snapshot = parseSnapshot(r.snapshot)
        return snapshot
          ? {
              id: r.id,
              postId: r.postId,
              createdAt: r.createdAt ?? '',
              note: r.note ?? null,
              snapshot,
            }
          : null
      })
      .filter((r): r is PostRevision => r !== null)
  },
  async getRevision(id) {
    const r = unwrap(await adminClient().models.PostRevision.get({ id }), 'getRevision')
    if (!r) return null
    const snapshot = parseSnapshot(r.snapshot)
    return snapshot
      ? { id: r.id, postId: r.postId, createdAt: r.createdAt ?? '', note: r.note ?? null, snapshot }
      : null
  },
  async createRevision(post, note) {
    unwrap(
      await adminClient().models.PostRevision.create({
        postId: post.id,
        snapshot: JSON.stringify(post),
        note,
      }),
      'createRevision'
    )
  },

  async listComments(status) {
    const result = await adminClient().models.Comment.listCommentsByStatus(
      { status },
      { sortDirection: 'DESC', limit: 200 }
    )
    return unwrap(result, 'listComments')
      .map((r) => toAdminComment(r as unknown as Record<string, unknown>))
      .filter((c) => c !== null)
  },
  async countComments(status) {
    const client = adminClient()
    const rows = await collect('countComments', (nextToken) =>
      client.models.Comment.listCommentsByStatus(
        { status },
        { nextToken, limit: 500, selectionSet: ['id'] }
      )
    )
    return rows.length
  },
  async getComment(id) {
    const result = await adminClient().models.Comment.get({ id })
    return toAdminComment(unwrap(result, 'getComment') as unknown as Record<string, unknown> | null)
  },
  async updateComment(id, patch, expiresAt) {
    unwrap(
      await adminClient().models.Comment.update({
        id,
        ...patch,
        moderatedAt: new Date().toISOString(),
        expiresAt,
      }),
      'updateComment'
    )
  },
  async deleteComment(id) {
    const client = adminClient()
    const replies = await collect('listReplies', (nextToken) =>
      client.models.Comment.list({
        filter: { parentId: { eq: id } },
        nextToken,
        selectionSet: ['id'],
      })
    )
    await Promise.all(replies.map((r) => client.models.Comment.delete({ id: r.id })))
    unwrap(await client.models.Comment.delete({ id }), 'deleteComment')
  },
  async createAuthorReply({ parent, body, authorName }) {
    unwrap(
      await adminClient().models.Comment.create({
        postId: parent.postId,
        postSlug: parent.postSlug,
        postLocale: parent.postLocale,
        postTitle: parent.postTitle,
        parentId: parent.parentId ?? parent.id,
        authorName,
        body,
        status: 'APPROVED',
        isAuthorReply: true,
      }),
      'createAuthorReply'
    )
  },

  async getSettings() {
    const result = await adminClient().models.SiteSettings.get({ id: SETTINGS_ID })
    return toSettings(unwrap(result, 'getSettings') as unknown as Record<string, unknown> | null)
  },
  async saveSettings(settings: SiteSettings) {
    const client = adminClient()
    const existing = unwrap(
      await client.models.SiteSettings.get({ id: SETTINGS_ID }),
      'getSettings'
    )
    const input = { id: SETTINGS_ID, ...settings }
    unwrap(
      existing
        ? await client.models.SiteSettings.update(input)
        : await client.models.SiteSettings.create(input),
      'saveSettings'
    )
  },
}
