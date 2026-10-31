import { defineConfig, devices } from '@playwright/test'

const PORT = 3300

// Runs against `next dev` with fixtures: no AWS needed, and the admin auth bypass
// (development only) lets the admin flows be exercised too.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /public\.spec\.ts/ },
  ],
  webServer: {
    command: `npm run ensure-outputs && npx next dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { BLOG_DATA_SOURCE: 'fixtures', NEXT_TELEMETRY_DISABLED: '1' },
  },
})
