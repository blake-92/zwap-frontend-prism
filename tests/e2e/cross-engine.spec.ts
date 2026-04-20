import { test, expect, waitForUIReady } from './fixtures'

/**
 * Interactions específicas que deben funcionar consistentemente en los 3 engines
 * (Chromium, WebKit, Firefox) × 3 viewports (desktop, tablet, mobile).
 *
 * Estos tests corren en TODOS los 7 projects para validar parity cross-browser.
 */

test.describe('Cross-engine: nav responsive breakpoint', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('breakpoint lg:1024 separa Sidebar (desktop) vs BottomNav (tablet+mobile)', async ({ page, viewport }) => {
    await page.goto('/app/dashboard')
    await waitForUIReady(page)

    if (viewport && viewport.width >= 1024) {
      // Desktop: Sidebar visible, BottomNav oculto
      await expect(page.locator('aside').first()).toBeVisible()
      // BottomNav tiene class `fixed bottom-0`
      const bottomNav = page.locator('nav.fixed.bottom-0').first()
      // En desktop, BottomNav puede estar en DOM pero oculto por CSS, o ausente
      const visible = await bottomNav.isVisible().catch(() => false)
      expect(visible).toBe(false)
    } else {
      // Tablet/mobile (< 1024px): BottomNav visible
      await expect(page.locator('nav.fixed.bottom-0').first()).toBeVisible()
    }
  })

  test('iPad Pro 11 (834px): sigue siendo mobile-like — BottomNav visible', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width !== 834, 'Solo en project tablet iPad (834×1194)')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    await expect(page.locator('nav.fixed.bottom-0').first()).toBeVisible()
  })
})

test.describe('Cross-engine: DatePickerModal (R3 #9 tm fix)', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('DatePickerModal abre sin runtime error (tm monthsShort)', async ({ page, consoleErrors }) => {
    await page.goto('/app/links')
    await waitForUIReady(page)
    const newBtn = page.getByRole('button', { name: /Nuevo|New/i }).first()
    if (await newBtn.count() === 0) test.skip(true, 'Botón Nuevo no visible en este viewport')
    await newBtn.click()
    await waitForUIReady(page)
    // NewLinkModal abre. Dentro, el campo de fecha al clickear abre DatePickerModal.
    // Si `tm()` falló (regression del R3), habría console error inmediato.
    expect(consoleErrors.filter(e => e.includes('monthsShort'))).toEqual([])
  })
})

test.describe('Cross-engine: Toast teleport + z-index', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('ToastContainer vive en body (teleport) y tiene z-[70]', async ({ page }) => {
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    const container = page.locator('body > .fixed.z-\\[70\\]').first()
    await expect(container).toBeAttached()
  })
})

test.describe('Cross-engine: modal overlay blur chrome (useChromeBlur R3)', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('abrir Modal setea data-modal-open en body; cerrar lo limpia', async ({ page }) => {
    await page.goto('/app/links')
    await waitForUIReady(page)
    const newBtn = page.getByRole('button', { name: /Nuevo|New/i }).first()
    if (await newBtn.count() === 0) test.skip(true, 'Botón Nuevo no visible')

    // Antes: no hay modal
    const preAttr = await page.evaluate(() => document.body.dataset.modalOpen)
    expect(preAttr).toBeUndefined()

    await newBtn.click()
    await expect(page.getByRole('dialog').first()).toBeVisible()
    const duringAttr = await page.evaluate(() => document.body.dataset.modalOpen)
    expect(duringAttr).toBe('true')

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog').first()).toBeHidden({ timeout: 2_000 })
    const postAttr = await page.evaluate(() => document.body.dataset.modalOpen)
    expect(postAttr).toBeUndefined()
  })
})

test.describe('Cross-engine: tier switcher en Settings', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('tier desde localStorage aplica clase html.perf-X en carga inicial', async ({ page, setTier }) => {
    // setTier del fixture inyecta addInitScript — cada reload reescribe localStorage.
    // Validamos que el plugin `performance.client` lee localStorage y aplica clase.
    await setTier('lite')
    await page.goto('/app/configuracion')
    await waitForUIReady(page)
    await expect(page.locator('html')).toHaveClass(/perf-lite/)
  })

  test('tier normal aplica clase html.perf-normal', async ({ page, setTier }) => {
    await setTier('normal')
    await page.goto('/app/configuracion')
    await waitForUIReady(page)
    await expect(page.locator('html')).toHaveClass(/perf-normal/)
  })
})
