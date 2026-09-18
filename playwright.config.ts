import { defineConfig } from '@playwright/test'

// PLAYWRIGHT_EXECUTABLE_PATH lets CI/sandbox environments point at a
// pre-installed Chromium instead of downloading one; unset locally to use
// Playwright's own managed browser (after `npx playwright install`).
export default defineConfig({
  testDir: './tests-e2e',
  timeout: 30000,
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 30000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {},
  },
  reporter: [['list']],
})
