import { describe, expect, it } from 'vitest'
import { slugify, tagSlug, validateSlug } from './slug'

describe('slugify', () => {
  it('transliterates Turkish letters', () => {
    expect(slugify('Neden Bölge Değiştirdim?')).toBe('neden-bolge-degistirdim')
    expect(slugify('Çağrı Şükrü Ünal Işık İstanbul')).toBe('cagri-sukru-unal-isik-istanbul')
  })

  it('handles English capital I like Turkish does not break it', () => {
    expect(slugify('Inside AWS IAM')).toBe('inside-aws-iam')
  })

  it('collapses symbols and trims dashes', () => {
    expect(slugify("  Paris'ten -- Virginia'ya!! ")).toBe('paris-ten-virginia-ya')
  })

  it('respects the max length without a trailing dash', () => {
    const slug = slugify('a'.repeat(30) + ' ' + 'b'.repeat(60), 40)
    expect(slug.length).toBeLessThanOrEqual(40)
    expect(slug.endsWith('-')).toBe(false)
  })
})

describe('validateSlug', () => {
  it('accepts clean slugs', () => {
    expect(validateSlug('nextjs-16-notes')).toBeNull()
  })

  it('rejects reserved and malformed slugs', () => {
    expect(validateSlug('admin')).toMatch(/reserved/)
    expect(validateSlug('arsiv')).toMatch(/reserved/)
    expect(validateSlug('Büyük-Harf')).not.toBeNull()
    expect(validateSlug('double--dash')).not.toBeNull()
    expect(validateSlug('')).not.toBeNull()
  })
})

describe('tagSlug', () => {
  it('slugifies tags', () => {
    expect(tagSlug('Erişilebilirlik')).toBe('erisilebilirlik')
  })
})
