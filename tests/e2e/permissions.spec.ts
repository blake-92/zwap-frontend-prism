import { test, expect, waitForUIReady } from './fixtures'

// Plan C — gating declarativo. Cada page con `requiresPermission` en `definePageMeta`
// es chequeada por `middleware/auth.js` contra `sessionStore.permissions[]`. Si falla,
// redirige a /app/dashboard con un toast `errors.noAccessRedirected`.
//
// Estos specs verifican el contrato role × ruta espejando el catálogo del backend
// (`PERMISSIONS_BY_ROLE` en fixtures.ts).

test.describe('Permissions — RECEPTIONIST gating', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth({ role: 'RECEPTIONIST' })
  })

  test('/app/wallet → redirect a /app/dashboard (no WALLET_VIEW)', async ({ page }) => {
    await page.goto('/app/wallet')
    await expect(page).toHaveURL(/\/app\/dashboard/)
  })

  test('/app/usuarios → redirect a /app/dashboard (no USERS_VIEW)', async ({ page }) => {
    await page.goto('/app/usuarios')
    await expect(page).toHaveURL(/\/app\/dashboard/)
  })

  test('/app/sucursales → redirect (no BRANCHES_MANAGE — solo ve selector en navbar)', async ({ page }) => {
    await page.goto('/app/sucursales')
    await expect(page).toHaveURL(/\/app\/dashboard/)
  })

  test('/app/liquidaciones → redirect a /app/dashboard (no SETTLEMENTS_VIEW)', async ({ page }) => {
    await page.goto('/app/liquidaciones')
    await expect(page).toHaveURL(/\/app\/dashboard/)
  })

  test('/app/links → carga (tiene LINKS_VIEW)', async ({ page }) => {
    await page.goto('/app/links')
    await waitForUIReady(page)
    await expect(page).toHaveURL(/\/app\/links/)
  })

  test('/app/transacciones → carga (tiene TRANSACTIONS_VIEW)', async ({ page }) => {
    await page.goto('/app/transacciones')
    await waitForUIReady(page)
    await expect(page).toHaveURL(/\/app\/transacciones/)
  })
})

test.describe('Permissions — ACCOUNTANT gating', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth({ role: 'ACCOUNTANT' })
  })

  test('/app/links → redirect (no LINKS_VIEW)', async ({ page }) => {
    await page.goto('/app/links')
    await expect(page).toHaveURL(/\/app\/dashboard/)
  })

  test('/app/usuarios → redirect (no USERS_VIEW)', async ({ page }) => {
    await page.goto('/app/usuarios')
    await expect(page).toHaveURL(/\/app\/dashboard/)
  })

  test('/app/sucursales → redirect (ACCOUNTANT no tiene BRANCHES_MANAGE — solo selector navbar)', async ({ page }) => {
    await page.goto('/app/sucursales')
    await expect(page).toHaveURL(/\/app\/dashboard/)
  })

  test('/app/wallet → carga (tiene WALLET_VIEW)', async ({ page }) => {
    await page.goto('/app/wallet')
    await waitForUIReady(page)
    await expect(page).toHaveURL(/\/app\/wallet/)
  })

  test('/app/liquidaciones → carga (tiene SETTLEMENTS_VIEW)', async ({ page }) => {
    await page.goto('/app/liquidaciones')
    await waitForUIReady(page)
    await expect(page).toHaveURL(/\/app\/liquidaciones/)
  })
})

test.describe('Permissions — ADMIN gating', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth({ role: 'ADMIN' })
  })

  test('/app/wallet → carga (tiene WALLET_VIEW)', async ({ page }) => {
    await page.goto('/app/wallet')
    await waitForUIReady(page)
    await expect(page).toHaveURL(/\/app\/wallet/)
  })

  test('/app/usuarios → carga (tiene USERS_VIEW)', async ({ page }) => {
    await page.goto('/app/usuarios')
    await waitForUIReady(page)
    await expect(page).toHaveURL(/\/app\/usuarios/)
  })

  // ADMIN no tiene WALLET_WITHDRAW pero sí WALLET_VIEW — la ruta carga, el botón
  // de retiro será gating de UI (fuera de scope para esta spec).
})

test.describe('Permissions — OWNER (default) acceso total', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth({ role: 'OWNER' })
  })

  for (const route of ['/app/wallet', '/app/usuarios', '/app/sucursales', '/app/links', '/app/transacciones', '/app/liquidaciones']) {
    test(`${route} → carga`, async ({ page }) => {
      await page.goto(route)
      await waitForUIReady(page)
      await expect(page).toHaveURL(new RegExp(route.replace(/\//g, '\\/')))
    })
  }
})

test.describe('Permissions — Sidebar/BottomNav filtrados por rol', () => {
  test('RECEPTIONIST en desktop: Sidebar NO muestra Liquidaciones/Usuarios/Sucursales', async ({ page, viewport, mockAuth }) => {
    test.skip(!viewport || viewport.width < 1024, 'Sidebar visible solo en desktop')
    await mockAuth({ role: 'RECEPTIONIST' })
    await page.goto('/app/dashboard')
    await waitForUIReady(page)

    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()

    // RECEPTIONIST no tiene SETTLEMENTS_VIEW, USERS_VIEW ni BRANCHES_MANAGE. La página
    // de Sucursales (gestión) requiere MANAGE — por eso no aparece en el sidebar. El
    // selector de sucursal del navbar usa BRANCHES_VIEW aparte (sí lo tiene).
    const liq = sidebar.getByRole('button', { name: /Liquidaciones|Settlements/i })
    const usr = sidebar.getByRole('button', { name: /Usuarios|Users/i })
    const suc = sidebar.getByRole('button', { name: /Sucursales|Branches/i })
    await expect(liq).toHaveCount(0)
    await expect(usr).toHaveCount(0)
    await expect(suc).toHaveCount(0)
  })

  test('OWNER en desktop: Sidebar muestra todos los items', async ({ page, viewport, mockAuth }) => {
    test.skip(!viewport || viewport.width < 1024, 'Sidebar visible solo en desktop')
    await mockAuth({ role: 'OWNER' })
    await page.goto('/app/dashboard')
    await waitForUIReady(page)

    const sidebar = page.locator('aside').first()
    await expect(sidebar.getByRole('button', { name: /Dashboard/i }).first()).toBeVisible()
    await expect(sidebar.getByRole('button', { name: /Liquidaciones|Settlements/i }).first()).toBeVisible()
    await expect(sidebar.getByRole('button', { name: /Usuarios|Users/i }).first()).toBeVisible()
    await expect(sidebar.getByRole('button', { name: /Sucursales|Branches/i }).first()).toBeVisible()
  })
})
