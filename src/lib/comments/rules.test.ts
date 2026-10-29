import { describe, expect, it } from 'vitest'
import { commentInputSchema, countLinks } from './rules'

const valid = {
  postId: 'p1',
  parentId: null,
  authorName: 'Ayşe',
  body: 'Harika bir yazı, teşekkürler!',
}

describe('comment rules', () => {
  it('accepts a normal comment', () => {
    expect(commentInputSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects links in names, markup and too many links', () => {
    expect(
      commentInputSchema.safeParse({ ...valid, authorName: 'http://spam.example' }).success
    ).toBe(false)
    expect(commentInputSchema.safeParse({ ...valid, authorName: '<b>x</b>' }).success).toBe(false)
    expect(
      commentInputSchema.safeParse({ ...valid, body: 'a http://a.co b http://b.co c http://c.co' })
        .success
    ).toBe(false)
  })

  it('enforces lengths after trimming', () => {
    expect(commentInputSchema.safeParse({ ...valid, body: '  a  ' }).success).toBe(false)
    expect(commentInputSchema.safeParse({ ...valid, body: 'x'.repeat(2001) }).success).toBe(false)
  })

  it('counts links', () => {
    expect(countLinks('see https://a.co and www.b.com')).toBe(2)
  })
})
