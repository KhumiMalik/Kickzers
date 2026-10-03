import { defineConfig, devices } from '@playwright/test'

const PORT = 5173
const isCI = Boolean(process.env.CI)

/**
 * End-to-end tests. Each test gets a fresh browser context (empty cookies and
 * localStorage), so tests are independent and can run in parallel.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 900 },
        // Locally use the installed Google Chrome (no browser download); CI installs Playwright's Chromium.
        channel: isCI ? undefined : 'chrome',
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
})
