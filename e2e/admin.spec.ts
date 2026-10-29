import { expect, test } from '@playwright/test'

// Fixtures + `next dev` only: the admin auth bypass never exists in a production build.
test.describe('admin', () => {
  test('write, publish and see a new post on the site', async ({ page }) => {
    await page.goto('/admin/posts/new')
    await page.getByLabel('Title', { exact: true }).fill('Playwright ile yazılmış bir test yazısı')
    await page.locator('.ProseMirror').click()
    await page.keyboard.type('Bu yazı uçtan uca testte oluşturuldu.')
    await page
      .getByLabel('Meta description')
      .fill('Uçtan uca testin oluşturduğu, yayımladığı ve sitede kontrol ettiği örnek yazı.')

    await page.getByRole('button', { name: 'Publish' }).click()
    await expect(page).toHaveURL(/\/admin\/posts\/p-/)
    await expect(page.getByText('Published', { exact: true }).first()).toBeVisible()

    await page.goto('/playwright-ile-yazilmis-bir-test-yazisi')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Playwright ile yazılmış bir test yazısı'
    )
    await expect(page.getByText('Bu yazı uçtan uca testte oluşturuldu.')).toBeVisible()
  })

  test('approve a pending comment', async ({ page }) => {
    await page.goto('/admin/comments')
    const card = page.locator('li', { hasText: 'Görselleri S3' })
    await card.getByRole('button', { name: 'Approve' }).click()
    await expect(page.locator('li', { hasText: 'Görselleri S3' })).toHaveCount(0)

    await page.goto('/paristen-virginiaya-dynamodb-tasima-gunlugu')
    await expect(
      page.getByText('Görselleri S3’e kopyalarken boyutları nasıl sakladın?')
    ).toBeVisible()
  })

  test('reserved slugs are rejected', async ({ page }) => {
    await page.goto('/admin/posts/new')
    await page.getByLabel('Title', { exact: true }).fill('Admin')
    await page
      .getByLabel('Meta description')
      .fill('Bu açıklama yeterince uzun olmalı ki doğrulamadan geçsin.')
    await page.getByRole('button', { name: 'Publish' }).click()
    await expect(page.getByText(/reserved by the site/).first()).toBeVisible()
  })
})
