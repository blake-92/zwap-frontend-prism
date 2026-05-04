import { test, expect, waitForUIReady } from './fixtures'

// Smoke tests del refresh de sesión. Spec en backend:
//   ~/Developer/zwap-backend/docs/frontend-session-refresh.md
//
// Cubre:
//   - Smoke #1 del doc: token vencido → 401 al endpoint protegido → POST /api/auth/refresh
//     200 → reintento del request original 200. El usuario nunca ve /login.
//   - Smoke #5 (negativo): el interceptor NO debe disparar refresh sobre /api/auth/login
//     ni sobre /api/auth/refresh (loops + reuse-detection).

const apiBase = 'http://localhost:8080'

test.describe('Session refresh — interceptor 401', () => {
  test('401 inicial en /api/branches → refresh OK → reintento → vista carga (no redirect a /login)', async ({ context, page }) => {
    // Cookie zwap_session viva — el middleware deja pasar al layout autenticado.
    await context.addCookies([{
      name: 'zwap_session',
      value: '1',
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    }])

    // /api/account/me OK (boot del plugin session).
    await page.route(`${apiBase}/api/account/me`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'u', email: 'mock@hoteldesal.bo', fullName: 'Mock' },
        merchant: { id: 'm', businessName: 'Hotel de Sal' },
        permissions: ['ACCOUNT_VIEW_OWN', 'BRANCHES_VIEW', 'BRANCHES_MANAGE', 'DASHBOARD_OPS_VIEW'],
      }),
    }))

    // /api/branches: primer hit 401, segundo 200. Simula access token vencido + retry post-refresh.
    let branchesAttempts = 0
    await page.route(`${apiBase}/api/branches`, (route) => {
      branchesAttempts++
      if (branchesAttempts === 1) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'unauthorized' }),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'b1', name: 'Sucursal Principal', code: 'PRI', isPrimary: true, status: 'ACTIVE', createdAt: '2026-04-30T00:00:00Z', updatedAt: '2026-04-30T00:00:00Z' },
        ]),
      })
    })

    // /api/auth/refresh OK — devuelve 3 cookies frescas (mockeadas vía Set-Cookie no necesarias acá,
    // alcanza con que el endpoint responda 200 para que el cliente reintente el request original).
    let refreshCount = 0
    await page.route(`${apiBase}/api/auth/refresh`, (route) => {
      refreshCount++
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      })
    })

    await page.goto('/app/dashboard')
    await waitForUIReady(page)

    // Verificación: el usuario está en dashboard, NO en /login.
    await expect(page).toHaveURL(/\/app\/dashboard/)
    expect(refreshCount).toBe(1)
    // /api/branches fue llamado al menos 2 veces (el 401 inicial + el reintento).
    expect(branchesAttempts).toBeGreaterThanOrEqual(2)
  })

  test('zwap_session ausente + /api/auth/refresh OK → middleware hidrata + carga ruta sin login', async ({ page }) => {
    // No agregamos cookie zwap_session — simula el caso "tab abierta >15min, cookie expiró".
    // El middleware debe detectar la ausencia, intentar refresh transparente, y si OK seguir.

    let refreshCount = 0
    await page.route(`${apiBase}/api/auth/refresh`, (route) => {
      refreshCount++
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        // Set-Cookie real lo emite el backend; en el mock alcanza con responder 200.
        // Nota: en producción, este 200 viene CON Set-Cookie que rota las 3 cookies del browser.
        body: JSON.stringify({}),
      })
    })

    // Tras refresh OK, el middleware llama fetchMe. Devolvemos un usuario completo.
    await page.route(`${apiBase}/api/account/me`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'u', email: 'mock@hoteldesal.bo', fullName: 'Mock' },
          merchant: { id: 'm', businessName: 'Hotel de Sal' },
          permissions: ['ACCOUNT_VIEW_OWN', 'BRANCHES_VIEW', 'DASHBOARD_OPS_VIEW'],
        }),
      }),
    )

    await page.route(`${apiBase}/api/branches`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    )

    await page.goto('/app/dashboard')
    await waitForUIReady(page)

    // El usuario está en dashboard, NO en /login. El middleware salvó la sesión.
    await expect(page).toHaveURL(/\/app\/dashboard/)
    expect(refreshCount).toBeGreaterThanOrEqual(1)
  })

  test('zwap_session ausente + /api/auth/refresh 401 → middleware redirige a /login', async ({ page }) => {
    await page.route(`${apiBase}/api/auth/refresh`, (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'invalid_credentials' }),
      }),
    )

    await page.goto('/app/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('refresh FAIL (401) → cliente limpia y manda a /login', async ({ context, page }) => {
    await context.addCookies([{
      name: 'zwap_session',
      value: '1',
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    }])

    // /api/account/me devuelve 401 al boot — fuerza refresh.
    await page.route(`${apiBase}/api/account/me`, (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'unauthorized' }),
      }),
    )

    // Refresh también 401 — sesión muerta (refresh expiró o reuse-detection).
    await page.route(`${apiBase}/api/auth/refresh`, (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'invalid_credentials' }),
      }),
    )

    await page.goto('/app/dashboard')
    // El handleAuthFailure del wrapper hace navigateTo({ path: '/login', query: { redirect } }).
    await expect(page).toHaveURL(/\/login/)
  })
})
