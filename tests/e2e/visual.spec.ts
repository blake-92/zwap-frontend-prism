import { test, expect, waitForUIReady } from './fixtures'

/**
 * Visual regression SELECTIVO:
 *   - Baseline solo en `desktop-chromium` y `mobile-pixel7` (reduce flakiness de font
 *     rendering cross-engine; los otros 5 projects validan layout sin screenshots).
 *   - 4 vistas representativas × 3 tiers × 2 themes = 24 snapshots por project
 *     → 48 snapshots totales (manejable, estable).
 *
 * Baselines generados con `npm run test:e2e -- tests/e2e/visual.spec.ts --update-snapshots`.
 * Tolerance 3% via `toHaveScreenshot.maxDiffPixelRatio` en playwright.config.ts.
 */

const VIEWS = [
  { path: '/app/dashboard',     name: 'dashboard' },
  { path: '/app/transacciones', name: 'transacciones' },
  { path: '/app/links',         name: 'links' },
  { path: '/app/configuracion', name: 'configuracion' },
]

const TIERS = ['full', 'normal', 'lite'] as const
const THEMES = ['dark', 'light'] as const

const VISUAL_PROJECTS = ['desktop-chromium', 'mobile-pixel7']

// Serial dentro del suite — evita flakiness por contención en el dev server cuando
// múltiples tests al mismo path/tier se ejecutan en paralelo. Los specs que no
// screenshotean (layout assertions) sí corren en paralelo.
test.describe.configure({ mode: 'serial' })

test.describe('Visual regression matrix', () => {
  test.beforeEach(async ({ mockAuth }, testInfo) => {
    // Solo generamos/comparamos snapshots en proyectos baseline. En los demás
    // (firefox/webkit/tablet/iphone) los tests corren pero el snapshot assert es skipped.
    testInfo.skip(
      !VISUAL_PROJECTS.includes(testInfo.project.name),
      'Visual baseline solo en desktop-chromium + mobile-pixel7',
    )
    await mockAuth()
  })

  for (const view of VIEWS) {
    for (const tier of TIERS) {
      for (const theme of THEMES) {
        const snapshotName = `${view.name}-${tier}-${theme}.png`

        test(`${view.name} · tier=${tier} · ${theme}`, async ({ page, setTier, setTheme }) => {
          await setTier(tier)
          await setTheme(theme)
          await page.goto(view.path)
          await waitForUIReady(page)
          // Espera para animaciones one-shot + stabilization
          await page.waitForTimeout(800)
          // Espera fonts listas para evitar subpixel antialiasing diff
          await page.evaluate(() => document.fonts.ready)
          await expect(page).toHaveScreenshot(snapshotName, {
            fullPage: false,
            animations: 'disabled',
            // Motion-v fade-in de cards puede quedar a medias; mask elementos con spinner
            mask: [page.locator('.animate-spin, .animate-pulse, .prism-qr-shimmer')],
          })
        })
      }
    }
  }
})

const LEGAL_VIEWS = [
  { path: '/legal/terminos', name: 'legal-terminos' },
  { path: '/legal/privacidad', name: 'legal-privacidad' },
  { path: '/legal/copyright', name: 'legal-copyright' },
]

test.describe('Visual regression — legal pages (públicas)', () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.skip(
      !VISUAL_PROJECTS.includes(testInfo.project.name),
      'Visual baseline solo en desktop-chromium + mobile-pixel7',
    )
  })

  for (const view of LEGAL_VIEWS) {
    for (const theme of THEMES) {
      const snapshotName = `${view.name}-full-${theme}.png`

      test(`${view.name} · full · ${theme}`, async ({ page, setTier, setTheme }) => {
        await setTier('full')
        await setTheme(theme)
        await page.goto(view.path)
        await waitForUIReady(page)
        await page.waitForTimeout(800)
        await page.evaluate(() => document.fonts.ready)
        await expect(page).toHaveScreenshot(snapshotName, {
          fullPage: false,
          animations: 'disabled',
          mask: [page.locator('.animate-spin, .animate-pulse, .prism-qr-shimmer')],
        })
      })
    }
  }
})

test.describe('Layout assertions cross-engine (todos los projects, sin screenshot)', () => {
  // Estos tests validan contenido/estructura en TODOS los engines — sin screenshot
  // para evitar false-positives de font rendering. Complementan visual.spec.ts
  // en Firefox/WebKit/tablet/iPhone donde el snapshot no corre.
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('dashboard renderiza main + sidebar|bottomnav según viewport', async ({ page, viewport }) => {
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    await expect(page.locator('main')).toBeVisible()
    if (viewport && viewport.width >= 1024) {
      await expect(page.locator('aside').first()).toBeVisible()
    } else {
      await expect(page.locator('nav.fixed.bottom-0').first()).toBeVisible()
    }
  })

  test('Lite: backdrop-filter queda en "none" aún en elementos .backdrop-blur-*', async ({ page, setTier }) => {
    await setTier('lite')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    // html.perf-lite debería aplicar reglas CSS que convierten backdrop-filter a none
    const blurredEls = page.locator('.backdrop-blur-2xl, .backdrop-blur-3xl, .backdrop-blur-xl')
    const count = await blurredEls.count()
    if (count > 0) {
      const filters = await blurredEls.evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).backdropFilter),
      )
      // Todos deben ser "none" (o vacío) en Lite por override CSS de globals.css
      for (const f of filters) {
        expect(['none', ''].includes(f)).toBe(true)
      }
    }
  })

  test('Prism dark: backdrop-filter activo en elementos .backdrop-blur-*', async ({ page, setTier, setTheme }) => {
    await setTier('full')
    await setTheme('dark')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    const blurred = page.locator('.backdrop-blur-2xl').first()
    if (await blurred.count() > 0) {
      const filter = await blurred.evaluate((el) => getComputedStyle(el).backdropFilter)
      expect(filter).not.toBe('none')
      expect(filter).toMatch(/blur/)
    }
  })

  test('tablet 834px: BottomNav visible (breakpoint lg:1024 → mobile en tablet)', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 640 || viewport.width >= 1024, 'Solo tablet/smaller')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    await expect(page.locator('nav.fixed.bottom-0').first()).toBeVisible()
  })

  test('Lite + light: Card con bg-white (no glass transparente)', async ({ page, setTier, setTheme }) => {
    await setTier('lite')
    await setTheme('light')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    // Cards en Lite light son bg-white sólido
    const card = page.locator('.rounded-\\[24px\\]').first()
    if (await card.count() > 0) {
      const bg = await card.evaluate((el) => getComputedStyle(el).backgroundColor)
      // rgb(255, 255, 255) o cercano
      expect(bg).toMatch(/rgb\(255,\s*255,\s*255\)/)
    }
  })
})

// ── KYB Wizard snapshots ───────────────────────────────────────────────────────────────────────
// Snapshots clave del wizard. Los step-N internos dependen de hidratación + JS y son frágiles
// para snapshot pixel-perfect; los dejamos para validación visual manual o E2E layout-based.
test.describe('Visual snapshots — KYB Wizard', () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.skip(
      !VISUAL_PROJECTS.includes(testInfo.project.name),
      'KYB visual baseline solo en desktop-chromium + mobile-pixel7',
    )
  })

  for (const theme of ['dark', 'light'] as const) {
    test(`onboarding-start · ${theme}`, async ({ page, setTheme }) => {
      await setTheme(theme)
      await page.goto('/onboarding/start')
      await waitForUIReady(page)
      await expect(page).toHaveScreenshot(`onboarding-start-${theme}.png`, {
        fullPage: true,
        animations: 'disabled',
      })
    })
  }

  test('onboarding-review · dark · banner SUBMITTED', async ({ page, setTheme }) => {
    await setTheme('dark')
    const API_BASE = 'http://localhost:8080'
    await page.addInitScript(() => {
      try {
        localStorage.setItem('zwap-kyb-application-id', 'app-vis')
        localStorage.setItem('zwap-kyb-application-token', 'tok-vis')
        localStorage.setItem('zwap-kyb-started-at', String(Date.now()))
      } catch {}
    })
    await page.route(`${API_BASE}/api/kyb/*`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ applicationId: 'app-vis', state: 'SUBMITTED', ownerEmail: 'visual@test.bo' }),
    }))
    await page.goto('/onboarding/review')
    await waitForUIReady(page)
    await expect(page).toHaveScreenshot('onboarding-review-submitted-dark.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})
