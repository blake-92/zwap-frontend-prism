import { defineConfig, devices } from '@playwright/test'

const PORT = 3000
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000, toHaveScreenshot: { maxDiffPixelRatio: 0.03 } },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Neutraliza motion-v repeat:Infinity + transitions largas
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    // Desktop — matriz de 3 engines
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-firefox',  use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-webkit',   use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    // Tablet — iPad Pro 11 en ambos engines
    { name: 'tablet-ipad-chromium', use: { ...devices['iPad Pro 11'], defaultBrowserType: 'chromium' } },
    { name: 'tablet-ipad-webkit',   use: { ...devices['iPad Pro 11'] } },
    // Mobile — Android (Chromium) + iPhone (WebKit) ≈ Safari mobile
    { name: 'mobile-pixel7',   use: { ...devices['Pixel 7'] } },
    { name: 'mobile-iphone14', use: { ...devices['iPhone 14'] } },
  ],
})
