import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import proxy, { config } from './proxy'

const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url })

describe('proxy matcher', () => {
  it('guards every admin path, whatever it ends with', () => {
    for (const url of ['/admin', '/admin/posts', '/admin/posts/x.png', '/admin/app.js']) {
      expect(matches(url), url).toBe(true)
    }
  })

  it('handles pages, feeds and Markdown copies', () => {
    for (const url of ['/', '/en/some-post', '/feed.xml', '/some-post.md', '/robots.txt']) {
      expect(matches(url), url).toBe(true)
    }
  })

  it('handles post slugs that start with "api"', () => {
    expect(matches('/api-gateway-notes')).toBe(true)
  })

  it('leaves API routes, Next internals and static files alone', () => {
    for (const url of ['/api/search', '/api', '/_next/static/x.js', '/favicon.ico', '/x.png']) {
      expect(matches(url), url).toBe(false)
    }
  })
})

describe('proxy', () => {
  it('answers paths the locale rewrite would break with 404 instead of 500', async () => {
    for (const path of ['/%25E0%25A4%25A', '/en/%25E0%25A4%25A', '/etiket/%25ZZ']) {
      const response = await proxy(new NextRequest(`http://localhost${path}`))
      expect(response.status, path).toBe(404)
    }
  })

  it('still rewrites ordinary paths to their locale', async () => {
    const response = await proxy(new NextRequest('http://localhost/some-post'))
    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost/tr/some-post')
  })
})
