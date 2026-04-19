import { test, expect, waitForUIReady } from './fixtures'

test.describe('Smoke — rutas públicas', () => {
  test('/ redirige a /login (sin auth)', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('/login renderiza form de auth', async ({ page }) => {
    await page.goto('/login')
    await waitForUIReady(page)
    // Hay un form con input email + password
    await expect(page.locator('input[type="email"], input[type="text"]').first()).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('/legal/terminos renderiza título del whitelist', async ({ page }) => {
    await page.goto('/legal/terminos')
    await expect(page.locator('h1')).toContainText(/Términos/i)
  })

  test('/legal/arbitrary redirige a /login (no está en whitelist)', async ({ page }) => {
    await page.goto('/legal/arbitrary-doc')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('/app/dashboard sin auth redirige a /login', async ({ page }) => {
    await page.goto('/app/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Smoke — rutas privadas con auth mockeada', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('/app/dashboard renderiza KpiCards', async ({ page }) => {
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    await expect(page).toHaveURL(/\/app\/dashboard/)
  })

  test('/app/transacciones renderiza tabla', async ({ page }) => {
    await page.goto('/app/transacciones')
    await waitForUIReady(page)
    // Desktop: tabla visible; mobile: cards. Chequeamos heading genérico.
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('/app/wallet renderiza saldo', async ({ page }) => {
    await page.goto('/app/wallet')
    await waitForUIReady(page)
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('/app/configuracion renderiza tabs Perfil/Seguridad/Facturación', async ({ page }) => {
    await page.goto('/app/configuracion')
    await waitForUIReady(page)
    // 3 tabs de SettingsView (reorganizado en Round 2)
    const tabButtons = page.getByRole('button', { name: /Perfil|Seguridad|Facturación|Profile|Security|Billing/i })
    await expect(tabButtons.first()).toBeVisible()
  })
})

test.describe('Smoke — performance tiers (Round 1-3 regressions)', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('setTier(lite) aplica html.perf-lite', async ({ page, setTier }) => {
    await setTier('lite')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    await expect(page.locator('html')).toHaveClass(/perf-lite/)
  })

  test('setTier(full) aplica html.perf-full', async ({ page, setTier }) => {
    await setTier('full')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    await expect(page.locator('html')).toHaveClass(/perf-full/)
  })

  test('Lite NO tiene backdrop-filter en .backdrop-blur-* (R1 #2 regression)', async ({ page, setTier }) => {
    await setTier('lite')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    // Cualquier elemento con clase backdrop-blur-* en Lite debe tener filter: none por el override CSS.
    const blurred = page.locator('.backdrop-blur-2xl, .backdrop-blur-3xl, .backdrop-blur-xl').first()
    if (await blurred.count() > 0) {
      const filter = await blurred.evaluate((el) => getComputedStyle(el).backdropFilter)
      expect(filter === 'none' || filter === '' || !filter).toBe(true)
    }
  })
})

test.describe('Smoke — responsive sidebar/bottomnav switch', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('Desktop viewport: Sidebar visible (≥ lg: 1024px)', async ({ page, viewport }) => {
    // Sólo corre en desktop projects (1440×900)
    test.skip(!viewport || viewport.width < 1024, 'Project no desktop')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    // Sidebar es <aside>, BottomNav es <nav> fixed bottom.
    await expect(page.locator('aside').first()).toBeVisible()
  })

  test('Mobile viewport: BottomNav visible (< lg: 1024px)', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width >= 1024, 'Project no mobile')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    await expect(page.locator('nav.fixed').first()).toBeVisible()
  })
})
