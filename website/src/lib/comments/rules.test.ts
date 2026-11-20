import { describe, expect, it } from 'vitest'
import { commentInputSchema, countLinks, impersonatesAuthor, stripUnsafeCharacters } from './rules'

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

  it('strips control and bidi characters but keeps line breaks and emoji joiners', () => {
    expect(stripUnsafeCharacters('a\u202Eb\u0000c\u200Bd')).toBe('abcd')
    expect(stripUnsafeCharacters('line 1\nline 2\ttab')).toBe('line 1\nline 2\ttab')
    expect(stripUnsafeCharacters('👩\u200D💻')).toBe('👩\u200D💻')
  })

  it('cleans the stored values', () => {
    const parsed = commentInputSchema.parse({ ...valid, authorName: '  Ay\u202Eşe ' })
    expect(parsed.authorName).toBe('Ayşe')
  })

  it('does not count invisible characters toward the minimum length', () => {
    expect(commentInputSchema.safeParse({ ...valid, body: 'a\u200B\u200B\u200Bb' }).success).toBe(
      false
    )
  })

  it("detects a visitor using the author's name", () => {
    expect(impersonatesAuthor('Mevlüt Canvar', 'Mevlüt Canvar')).toBe(true)
    expect(impersonatesAuthor('MEVLUT  canvar', 'Mevlüt Canvar')).toBe(true)
    expect(impersonatesAuthor('mevlut.canvar (official)', 'Mevlüt Canvar')).toBe(true)
    expect(impersonatesAuthor('Mevlüt', 'Mevlüt Canvar')).toBe(false)
    expect(impersonatesAuthor('Ayşe', 'Mevlüt Canvar')).toBe(false)
  })
})
