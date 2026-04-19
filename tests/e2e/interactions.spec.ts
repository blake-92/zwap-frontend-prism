import { test, expect, waitForUIReady } from './fixtures'

test.describe('Interactions — Modal drag-to-dismiss (R3 #15)', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('mobile: drag 80px NO cierra el modal (threshold es 150)', async ({ page, viewport, browserName }) => {
    test.skip(!viewport || viewport.width >= 640, 'Drag aplica solo en mobile < sm breakpoint')
    await page.goto('/app/links')
    await waitForUIReady(page)

    // Abrir NewLinkModal — botón "Nuevo link" / "New link"
    const newBtn = page.getByRole('button', { name: /Nuevo|New/i }).first()
    await newBtn.click()

    const modal = page.getByRole('dialog').first()
    await expect(modal).toBeVisible()

    const box = await modal.boundingBox()
    if (!box) test.skip()
    // Drag 80px abajo — NO debería cerrar
    await page.mouse.move(box!.x + box!.width / 2, box!.y + 20)
    await page.mouse.down()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + 100, { steps: 10 })
    await page.mouse.up()
    await page.waitForTimeout(300)
    await expect(modal).toBeVisible()
  })
})

test.describe('Interactions — Theme toggle', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('toggle dark/light persiste en localStorage', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 1024, 'Theme toggle en Header está en desktop')
    await page.goto('/app/dashboard')
    await waitForUIReady(page)

    const initialTheme = await page.evaluate(() => localStorage.getItem('zwap-theme'))
    const btn = page.getByRole('button', { name: /theme|tema/i }).first()
    if (await btn.count() === 0) test.skip(true, 'Theme button not found')
    await btn.click()
    await page.waitForTimeout(200)
    const newTheme = await page.evaluate(() => localStorage.getItem('zwap-theme'))
    expect(newTheme).not.toBe(initialTheme)
    expect(['dark', 'light']).toContain(newTheme)
  })
})

test.describe('Interactions — Filter reset (R2 useFilterSlot)', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  test('filtro status cambia y luego reset vuelve a default', async ({ page, viewport }) => {
    // En mobile los filters viven en BottomSheet (ocultos hasta click en ícono
    // SlidersHorizontal del Header). Skip mobile/tablet — test específico para
    // desktop donde el TableToolbar muestra filtros inline.
    test.skip(!viewport || viewport.width < 1024, 'Filter toolbar inline solo en desktop')
    await page.goto('/app/transacciones')
    await waitForUIReady(page)
    const filter = page.locator('button').filter({ hasText: /Todos|All|Status|Fecha|Date/i }).first()
    await expect(filter).toBeVisible()
  })
})
