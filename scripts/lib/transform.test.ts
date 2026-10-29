import { describe, expect, it } from 'vitest'
import { htmlToMarkdown, transformComment, transformPost, type MigrationWarning } from './transform'

describe('migration transform', () => {
  it('converts old HTML to Markdown and demotes H1', () => {
    const md = htmlToMarkdown(
      '<h1>Başlık</h1><p>Merhaba <strong>dünya</strong> <a href="https://a.co">link</a></p><ul><li>bir</li><li>iki</li></ul><pre><code>const a = 1</code></pre><script>x()</script>'
    )
    expect(md).toContain('## Başlık')
    expect(md).toContain('**dünya**')
    expect(md).toContain('[link](https://a.co)')
    expect(md).toContain('-   bir')
    expect(md).toContain('```')
    expect(md).not.toContain('x()')
  })

  it('flattens highlighted code and keeps unescaped markup inside <pre> as text', () => {
    const highlighted = htmlToMarkdown(
      '<pre><code class="language-bash">RewriteEngine On\n<span class="hljs-comment">#comment</span></code></pre>'
    )
    expect(highlighted).toContain('```bash\nRewriteEngine On\n#comment\n```')

    const xml = htmlToMarkdown('<pre>\n<rule name="Rule"><match url="^(.*)$" /></rule>\n</pre>')
    expect(xml).toContain('<rule name="Rule">')
    expect(xml).toContain('<match url="^(.*)$" />')
    expect(xml.startsWith('```')).toBe(true)
  })

  it('promotes the first row of header-less tables', () => {
    const md = htmlToMarkdown(
      '<table><tbody><tr><td><strong>Olay</strong></td><td><strong>Etiket</strong></td></tr><tr><td>Nobel</td><td>#mutlu</td></tr></tbody></table>'
    )
    expect(md.split('\n').slice(0, 3)).toEqual([
      '| **Olay** | **Etiket** |',
      '| --- | --- |',
      '| Nobel | #mutlu |',
    ])
  })

  it('falls back to the misspelled descripton attribute', () => {
    const post = transformPost(
      { id: 'd', language: 'tr', title: 'T', slug: 't', descripton: 'Eski özet' },
      {},
      []
    )
    expect(post.description).toBe('Eski özet')
  })

  it('keeps ids and dates, maps language, flags for review', () => {
    const warnings: MigrationWarning[] = []
    const post = transformPost(
      {
        id: 'old-1',
        __typename: 'Post',
        language: 'tr',
        title: 'Merhaba',
        slug: 'merhaba-dunya',
        description: 'İlk yazı',
        content: '<p>Merhaba dünya</p><img src="https://old.example/a.png">',
        createdAt: '2022-05-31T18:52:15.811Z',
        updatedAt: '2022-06-01T10:00:00.000Z',
        owner: 'abc::abc',
      },
      { 'tr:merhaba-dunya': 'hello-world' },
      warnings
    )
    expect(post).toMatchObject({
      id: 'old-1',
      __typename: 'Post',
      locale: 'tr',
      translationKey: 'hello-world',
      status: 'PUBLISHED',
      needsReview: true,
      publishedAt: '2022-05-31T18:52:15.811Z',
      createdAt: '2022-05-31T18:52:15.811Z',
      updatedAt: '2022-06-01T10:00:00.000Z',
    })
    expect(post).not.toHaveProperty('owner')
    expect(post.legacyHtml).toContain('<p>Merhaba dünya</p>')
    expect(warnings.some((w) => w.message.includes('external image'))).toBe(true)
  })

  it('repairs unsafe slugs and warns', () => {
    const warnings: MigrationWarning[] = []
    const post = transformPost(
      { id: 'x', language: 'tr', title: 'Çay', slug: 'Çay Saati' },
      {},
      warnings
    )
    expect(post.slug).toBe('cay-saati')
    expect(warnings[0]?.message).toMatch(/redirect/)
  })

  it('re-queues old comments for moderation', () => {
    const warnings: MigrationWarning[] = []
    const posts = new Map([['p1', { id: 'p1', slug: 's', locale: 'tr', title: 'T' }]])
    expect(
      transformComment({ id: 'c1', postCommentsId: 'p1', content: 'Güzel' }, posts, warnings)
    ).toMatchObject({
      postId: 'p1',
      status: 'PENDING',
      body: 'Güzel',
      authorName: 'Okur',
    })
    expect(transformComment({ id: 'c2', postCommentsId: 'missing' }, posts, warnings)).toBeNull()
  })
})
