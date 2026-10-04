import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'
import { apiServerCommand, apiUrl, backendDir, backendEnv, FRONTEND_PORT, frontendUrl } from './e2e/support/servers'

const isCI = Boolean(process.env.CI)

/**
 * End-to-end tests against the real Laravel API.
 *
 * Playwright starts two servers on dedicated ports (see e2e/support/servers.js):
 * the Laravel API on a throwaway SQLite database, and Vite pointing at it.
 * global-setup.js re-creates and seeds that database before every run.
 * Each test gets a fresh browser context (empty cookies and localStorage), so
 * tests are independent and can run in parallel.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.js',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // PHP's built-in server answers one request at a time, so a few workers are plenty.
  workers: isCI ? 2 : 3,
  timeout: 60_000,
  // Pages wait for the real API, so allow assertions a little longer than the 5 s default.
  expect: { timeout: 10_000 },
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: frontendUrl,
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
  webServer: [
    {
      command: apiServerCommand(),
      cwd: path.join(backendDir, 'public'),
      env: backendEnv,
      url: `${apiUrl}/api/v1/health`,
      // PHP's built-in server logs every request on stderr; Laravel's own errors still go to storage/logs.
      stderr: 'ignore',
      reuseExistingServer: !isCI,
      timeout: 60_000,
    },
    {
      command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      env: { VITE_API_URL: `${apiUrl}/api/v1` },
      url: frontendUrl,
      reuseExistingServer: !isCI,
      timeout: 60_000,
    },
  ],
})
