import { test as base, expect, type Page } from '@playwright/test'

type PerfTier = 'full' | 'normal' | 'lite'
type ThemeMode = 'dark' | 'light'

interface ZwapFixtures {
  /** Set el perf tier vía localStorage antes del primer navigate. Reload implícito. */
  setTier: (tier: PerfTier) => Promise<void>
  /** Set el theme mode vía localStorage antes del primer navigate. */
  setTheme: (mode: ThemeMode) => Promise<void>
  /** Inyecta cookie zwap_token para saltar middleware auth. */
  mockAuth: () => Promise<void>
  /** Array reactivo con errores de consola y pageerror acumulados durante el test. */
  consoleErrors: string[]
}

export const test = base.extend<ZwapFixtures>({
  // consoleErrors: worker-scoped array que se llena durante el test.
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`)
    })
    page.on('pageerror', (err) => {
      errors.push(`[pageerror] ${err.message}`)
    })
    await use(errors)
  },

  setTier: async ({ page }, use) => {
    const setter = async (tier: PerfTier) => {
      await page.addInitScript((t) => {
        try { localStorage.setItem('zwap-perf', t) } catch {}
      }, tier)
    }
    await use(setter)
  },

  setTheme: async ({ page }, use) => {
    const setter = async (mode: ThemeMode) => {
      await page.addInitScript((m) => {
        try { localStorage.setItem('zwap-theme', m) } catch {}
      }, mode)
    }
    await use(setter)
  },

  mockAuth: async ({ context }, use) => {
    const setter = async () => {
      await context.addCookies([{
        name: 'zwap_token',
        value: 'mock-jwt-token',
        domain: 'localhost',
        path: '/',
        sameSite: 'Lax',
      }])
    }
    await use(setter)
  },
})

export { expect }

// Utility: wait hasta que Tailwind + fonts listos para evitar visual flakiness.
export async function waitForUIReady(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
}
