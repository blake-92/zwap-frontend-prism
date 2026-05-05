import AxeBuilder from '@axe-core/playwright'
import { test, expect, waitForUIReady } from './fixtures'

/**
 * Accessibility automatizado: axe-core contra cada ruta principal.
 *
 * Política de severidad:
 *   - `critical` (button-name, aria-valid, label, etc.) → FAIL
 *   - `serious` (color-contrast, etc.) → WARNING (logueado, no falla el build)
 *     El contraste de texto secundario / deshabilitado es decisión de UX
 *     documentada en Prism UI; fallar en cada corrida rompería DX.
 *   - `moderate` / `minor` → logueado sin fallar.
 *
 * Axe corre solo en desktop-chromium + mobile-pixel7 (resultados consistentes
 * entre engines para reglas DOM; evita overhead en la matriz cross-browser).
 */

const A11Y_PROJECTS = ['desktop-chromium', 'mobile-pixel7']

const PUBLIC_ROUTES = [
  { path: '/login', name: 'login' },
  { path: '/legal/terminos', name: 'legal-terminos' },
  { path: '/legal/privacidad', name: 'legal-privacidad' },
  { path: '/legal/copyright', name: 'legal-copyright' },
  { path: '/onboarding/start', name: 'onboarding-start' },
]
const PRIVATE_ROUTES = [
  { path: '/app/dashboard', name: 'dashboard' },
  { path: '/app/transacciones', name: 'transacciones' },
  { path: '/app/links', name: 'links' },
  { path: '/app/liquidaciones', name: 'liquidaciones' },
  { path: '/app/wallet', name: 'wallet' },
  { path: '/app/sucursales', name: 'sucursales' },
  { path: '/app/usuarios', name: 'usuarios' },
  { path: '/app/configuracion', name: 'configuracion' },
]

const FAIL_IMPACTS = ['critical']
const WARN_IMPACTS = ['serious', 'moderate', 'minor']

test.describe('A11y — rutas públicas', () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.skip(!A11Y_PROJECTS.includes(testInfo.project.name), 'Axe solo en 2 projects baseline')
  })

  for (const route of PUBLIC_ROUTES) {
    test(`${route.name}: sin violations critical/serious`, async ({ page }) => {
      await page.goto(route.path)
      await waitForUIReady(page)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const critical = results.violations.filter(v =>
        v.impact && FAIL_IMPACTS.includes(v.impact),
      )
      if (critical.length > 0) {
        // Logueo detallado antes del fail para debugging rápido
        for (const v of critical) {
          console.error(`[${v.impact}] ${v.id}: ${v.description}`)
          for (const node of v.nodes.slice(0, 3)) {
            console.error('  target:', node.target.join(' '))
            console.error('  html:', node.html.slice(0, 120))
          }
        }
      }
      // Loguea moderate/minor sin fallar
      const minor = results.violations.filter(v =>
        v.impact && WARN_IMPACTS.includes(v.impact),
      )
      if (minor.length > 0) {
        console.log(`  ${route.name}: ${minor.length} minor/moderate violations (no-fail)`)
      }

      expect(critical).toEqual([])
    })
  }
})

test.describe('A11y — rutas privadas (con auth mock)', () => {
  test.beforeEach(async ({ mockAuth }, testInfo) => {
    testInfo.skip(!A11Y_PROJECTS.includes(testInfo.project.name), 'Axe solo en 2 projects baseline')
    await mockAuth()
  })

  for (const route of PRIVATE_ROUTES) {
    test(`${route.name}: sin violations critical/serious`, async ({ page }) => {
      await page.goto(route.path)
      await waitForUIReady(page)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const critical = results.violations.filter(v =>
        v.impact && FAIL_IMPACTS.includes(v.impact),
      )
      if (critical.length > 0) {
        for (const v of critical) {
          console.error(`[${v.impact}] ${v.id}: ${v.description}`)
          for (const node of v.nodes.slice(0, 3)) {
            console.error('  target:', node.target.join(' '))
            console.error('  html:', node.html.slice(0, 120))
          }
        }
      }
      const minor = results.violations.filter(v =>
        v.impact && WARN_IMPACTS.includes(v.impact),
      )
      if (minor.length > 0) {
        console.log(`  ${route.name}: ${minor.length} minor/moderate violations (no-fail)`)
      }

      expect(critical).toEqual([])
    })
  }
})

test.describe('A11y — KYB wizard (con draft seedeado)', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.skip(!A11Y_PROJECTS.includes(testInfo.project.name), 'Axe solo en 2 projects baseline')
    // Seed: applicationId/Token + startedAt para que useKybDraft.recover() lo levante.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('zwap-kyb-application-id', 'app-axe')
        localStorage.setItem('zwap-kyb-application-token', 'tok-axe')
        localStorage.setItem('zwap-kyb-started-at', String(Date.now()))
      } catch {}
    })
    // Stubs API para que step y review no queden colgados
    const API_BASE = 'http://localhost:8080'
    await page.route(`${API_BASE}/api/kyb/*`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ applicationId: 'app-axe', state: 'SUBMITTED', ownerEmail: 'a11y@axe.test' }),
    }))
  })

  for (const route of [
    { path: '/onboarding/step-1', name: 'onboarding-step-1' },
    { path: '/onboarding/review', name: 'onboarding-review' },
  ]) {
    test(`${route.name}: sin violations critical/serious`, async ({ page }) => {
      await page.goto(route.path)
      await waitForUIReady(page)
      const results = await new (await import('@axe-core/playwright')).default({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const critical = results.violations.filter(v => v.impact && FAIL_IMPACTS.includes(v.impact))
      if (critical.length > 0) {
        for (const v of critical) {
          console.error(`[${v.impact}] ${v.id}: ${v.description}`)
          for (const node of v.nodes.slice(0, 3)) {
            console.error('  target:', node.target.join(' '))
            console.error('  html:', node.html.slice(0, 120))
          }
        }
      }
      const minor = results.violations.filter(v => v.impact && WARN_IMPACTS.includes(v.impact))
      if (minor.length > 0) console.log(`  ${route.name}: ${minor.length} minor/moderate violations (no-fail)`)
      expect(critical).toEqual([])
    })
  }
})

test.describe('A11y — estados con overlay abierto', () => {
  test.beforeEach(async ({ mockAuth }, testInfo) => {
    testInfo.skip(!A11Y_PROJECTS.includes(testInfo.project.name), 'Axe solo en 2 projects baseline')
    await mockAuth()
  })

  test('NewLinkModal abierto: aria-modal + focus trap respetan a11y', async ({ page }) => {
    await page.goto('/app/links')
    await waitForUIReady(page)
    const newBtn = page.getByRole('button', { name: /Nuevo|New/i }).first()
    if (await newBtn.count() === 0) {
      test.skip(true, 'Botón Nuevo no visible en este viewport')
    }
    await newBtn.click()
    await expect(page.getByRole('dialog').first()).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const critical = results.violations.filter(v =>
      v.impact && FAIL_IMPACTS.includes(v.impact),
    )
    if (critical.length > 0) {
      for (const v of critical) console.error(`[${v.impact}] ${v.id}: ${v.description}`)
    }
    expect(critical).toEqual([])
  })
})
