import { describe, expect, it } from 'vitest'
import { safeRedirectPath } from './safe-redirect'

describe('safeRedirectPath', () => {
  it('keeps same-site paths', () => {
    expect(safeRedirectPath('/en/some-post?x=1#comments')).toBe('/en/some-post?x=1#comments')
    expect(safeRedirectPath('/')).toBe('/')
  })

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/\t/evil.example',
    '/\\/evil.example',
    'javascript:alert(1)',
    '',
    null,
    undefined,
  ])('falls back for %j', (target) => {
    expect(safeRedirectPath(target)).toBe('/')
  })

  it('leaves encoded characters encoded', () => {
    expect(safeRedirectPath('/%09/evil.example')).toBe('/%09/evil.example')
  })
})
