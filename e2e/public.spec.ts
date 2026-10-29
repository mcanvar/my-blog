import { expect, test } from '@playwright/test'

test.describe('public site', () => {
  test('home is a horizontal trail that loads more posts', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Mevlüt Canvar/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr-TR')

    const feed = page.getByRole('feed')
    await expect(feed).toBeVisible()
    await expect(feed.locator('article')).toHaveCount(10)

    // The track scrolls sideways, not the page.
    const scroll = await feed.evaluate((el) => ({ width: el.scrollWidth, client: el.clientWidth }))
    expect(scroll.width).toBeGreaterThan(scroll.client)

    // Reaching the right edge loads the next page.
    await feed.evaluate((el) => el.scrollTo({ left: el.scrollWidth }))
    await expect.poll(() => feed.locator('article').count()).toBeGreaterThan(10)
    await expect(page.getByText('Patikanın başına geldin.')).toBeVisible()
  })

  test('crawlable pagination exists without JavaScript', async ({ page }) => {
    const response = await page.goto('/sayfa/2')
    expect(response?.status()).toBe(200)
    expect(await page.getByRole('feed').locator('article').count()).toBeGreaterThan(0)
  })

  test('post page has structured data, hreflang and the translation link', async ({ page }) => {
    await page.goto('/paristen-virginiaya-dynamodb-tasima-gunlugu')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/DynamoDB/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://mcanvar.dev/paristen-virginiaya-dynamodb-tasima-gunlugu'
    )
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
      'href',
      /\/en\/paris-to-virginia/
    )

    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) =>
        nodes.flatMap((n) =>
          (JSON.parse(n.textContent ?? '{}')['@graph'] ?? []).map(
            (g: { '@type': string }) => g['@type']
          )
        )
      )
    expect(types).toEqual(
      expect.arrayContaining(['BlogPosting', 'BreadcrumbList', 'FAQPage', 'WebSite', 'Person'])
    )

    await page.getByRole('link', { name: 'Read in English →' }).click()
    await expect(page).toHaveURL(/\/en\/paris-to-virginia-dynamodb-migration-log$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  })

  test('drafts are not public', async ({ page }) => {
    const response = await page.goto('/en/why-a-horizontal-homepage')
    expect(response?.status()).toBe(404)
    await expect(page.getByText('You wandered off the trail.')).toBeVisible()
  })

  test('GEO files are served', async ({ request }) => {
    const md = await request.get('/paristen-virginiaya-dynamodb-tasima-gunlugu.md')
    expect(md.headers()['content-type']).toContain('text/markdown')
    expect(await md.text()).toContain('# Paris')

    const llms = await request.get('/llms.txt')
    expect(await llms.text()).toContain('## Posts (English)')

    const robots = await request.get('/robots.txt')
    const robotsText = await robots.text()
    expect(robotsText).toContain('User-Agent: GPTBot')
    expect(robotsText).toContain('Disallow: /admin')

    const sitemap = await request.get('/sitemap.xml')
    expect(await sitemap.text()).toContain('hreflang="en"')
  })

  test('comment goes to moderation', async ({ page }) => {
    await page.goto('/paristen-virginiaya-dynamodb-tasima-gunlugu')
    await page.getByLabel('Adın').fill('Test Okur')
    await page.getByLabel('Yorumun').fill('Bu bir deneme yorumudur, teşekkürler.')
    await page.getByRole('button', { name: 'Gönder' }).click()
    await expect(page.getByRole('status')).toHaveText(/onaylandıktan sonra/)
  })
})
