import { describe, expect, it, vi } from 'vitest'
import {
  decodeToken,
  encodeToken,
  getPublishedPost,
  isLive,
  listApprovedComments,
  listPublishedPosts,
  routePublicQuery,
  type QueryFn,
} from './queries'

const NOW = '2026-10-29T00:00:00.000Z'

describe('public reader', () => {
  it('treats only published (or due scheduled) posts as live', () => {
    expect(isLive({ status: 'PUBLISHED', publishedAt: '2026-01-01T00:00:00.000Z' }, NOW)).toBe(true)
    expect(isLive({ status: 'SCHEDULED', publishedAt: '2026-01-01T00:00:00.000Z' }, NOW)).toBe(true)
    expect(isLive({ status: 'SCHEDULED', publishedAt: '2027-01-01T00:00:00.000Z' }, NOW)).toBe(
      false
    )
    expect(isLive({ status: 'DRAFT', publishedAt: '2026-01-01T00:00:00.000Z' }, NOW)).toBe(false)
    expect(isLive({ status: 'PUBLISHED' }, NOW)).toBe(false)
  })

  it('queries the locale index up to now and filters out anything not live', async () => {
    const query = vi.fn<QueryFn>().mockResolvedValue({
      Items: [
        { id: 'a', status: 'PUBLISHED', publishedAt: '2026-10-01T00:00:00.000Z' },
        { id: 'b', status: 'DRAFT', publishedAt: '2026-10-01T00:00:00.000Z' },
      ],
      LastEvaluatedKey: { id: 'a' },
    })
    const result = await listPublishedPosts(query, 'Post', { locale: 'tr', limit: 500 }, NOW)
    const input = query.mock.calls[0]![0]
    expect(input.IndexName).toBe('byLocale')
    expect(input.ExpressionAttributeValues).toMatchObject({ ':locale': 'tr', ':now': NOW })
    expect(input.Limit).toBe(50)
    expect(result.items.map((i) => i.id)).toEqual(['a'])
    expect(decodeToken(result.nextToken)).toEqual({ id: 'a' })
  })

  it('never returns a draft by slug', async () => {
    const query = vi.fn<QueryFn>().mockResolvedValue({
      Items: [{ id: 'x', status: 'DRAFT', publishedAt: '2026-01-01T00:00:00.000Z' }],
    })
    expect(await getPublishedPost(query, 'Post', { locale: 'tr', slug: 'x' }, NOW)).toBeNull()
  })

  it('returns only approved comments', async () => {
    const query = vi.fn<QueryFn>().mockResolvedValue({
      Items: [
        { id: '1', status: 'APPROVED' },
        { id: '2', status: 'PENDING' },
      ],
    })
    const comments = await listApprovedComments(query, 'Comment', { postId: 'p' })
    expect(comments.map((c) => c.id)).toEqual(['1'])
  })

  it('round-trips pagination tokens and ignores garbage', () => {
    expect(decodeToken(encodeToken({ a: 1 }))).toEqual({ a: 1 })
    expect(decodeToken('not-base64-json')).toBeUndefined()
  })

  it('routes the Amplify Gen 2 event shape (fieldName at the top level)', async () => {
    const query = vi.fn<QueryFn>().mockResolvedValue({ Items: [] })
    const tables = { post: 'Post', comment: 'Comment' }
    await routePublicQuery(
      { fieldName: 'listPublishedPosts', arguments: { locale: 'en' } },
      query,
      tables
    )
    expect(query.mock.calls[0]![0]).toMatchObject({ TableName: 'Post', IndexName: 'byLocale' })
    await routePublicQuery(
      { fieldName: 'listApprovedComments', arguments: { postId: 'p' } },
      query,
      tables
    )
    expect(query.mock.calls[1]![0]).toMatchObject({ TableName: 'Comment', IndexName: 'byPost' })
    await expect(routePublicQuery({ arguments: {} }, query, tables)).rejects.toThrow(
      'Unknown field'
    )
  })
})
