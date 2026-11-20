import { describe, expect, it } from 'vitest'
import { isSlugParam, slugify, tagSlug, validateSlug } from './slug'

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

describe('isSlugParam', () => {
  it('accepts slugs and nothing that needs decoding', () => {
    expect(isSlugParam('paristen-virginiaya-dynamodb-tasima-gunlugu')).toBe(true)
    expect(isSlugParam('%E0%A4%A')).toBe(false)
    expect(isSlugParam('../admin')).toBe(false)
    expect(isSlugParam('Büyük')).toBe(false)
    expect(isSlugParam('a'.repeat(81))).toBe(false)
    expect(isSlugParam('a'.repeat(41), 40)).toBe(false)
  })
})
