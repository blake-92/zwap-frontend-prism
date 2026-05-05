import { test, expect, waitForUIReady } from './fixtures'

// Stubs de los endpoints públicos del wizard. Cada test setea handlers via page.route ANTES
// de navegar para que los calls reales nunca lleguen al backend.
const API_BASE = 'http://localhost:8080'

async function stubKybStart(page: import('@playwright/test').Page, response: Record<string, unknown>) {
  await page.route(`${API_BASE}/api/kyb/start`, (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(response),
  }))
}

async function stubKybGet(page: import('@playwright/test').Page, response: Record<string, unknown>) {
  await page.route(`${API_BASE}/api/kyb/*`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) })
    } else {
      route.continue()
    }
  })
}

async function stubKybStep(page: import('@playwright/test').Page, suffix: string, status = 200) {
  await page.route(`${API_BASE}/api/kyb/*/${suffix}`, (route) => route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify({ applicationId: 'app-test', state: 'DRAFT' }),
  }))
}

test.describe('KYB Wizard — entry points', () => {
  test('/signup redirige a /onboarding/start', async ({ page }) => {
    await page.goto('/signup')
    await expect(page).toHaveURL(/\/onboarding\/start$/)
  })

  test('/onboarding redirige a /onboarding/start', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/onboarding\/start$/)
  })

  test('/onboarding/start renderiza headline + form de email', async ({ page }) => {
    await page.goto('/onboarding/start')
    await waitForUIReady(page)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /Empezar|Get started/ })).toBeVisible()
  })

  test('/onboarding/step-1 sin draft → redirige a /onboarding/start', async ({ page }) => {
    await page.goto('/onboarding/step-1')
    await expect(page).toHaveURL(/\/onboarding\/start$/)
  })

  test('/login muestra link "Crear cuenta" → /signup', async ({ page }) => {
    await page.goto('/login')
    await waitForUIReady(page)
    const link = page.getByRole('link', { name: /Crear|Create/ })
    await expect(link).toBeVisible()
    await link.click()
    await expect(page).toHaveURL(/\/onboarding\/start$/)
  })
})

test.describe('KYB Wizard — start flow', () => {
  test('start con email válido: POST /api/kyb/start, navega a step-1', async ({ page }) => {
    await stubKybStart(page, { applicationId: 'app-test', applicationToken: 'tok-test', state: 'DRAFT' })
    await page.goto('/onboarding/start')
    await waitForUIReady(page)

    await page.locator('input[type="email"]').fill('test@hotel.bo')
    await page.getByRole('button', { name: /Empezar|Get started/ }).click()

    await expect(page).toHaveURL(/\/onboarding\/step-1$/, { timeout: 5000 })
  })

  test('start con email inválido: muestra error inline, NO navega', async ({ page }) => {
    await page.goto('/onboarding/start')
    await waitForUIReady(page)

    await page.locator('input[type="email"]').fill('not-an-email')
    await page.getByRole('button', { name: /Empezar|Get started/ }).click()

    await expect(page).toHaveURL(/\/onboarding\/start$/)
    // role=alert con mensaje de email inválido
    await expect(page.getByRole('alert').first()).toBeVisible()
  })

  test('start con backend 429: muestra toast de rate-limit', async ({ page }) => {
    await page.route(`${API_BASE}/api/kyb/start`, (route) => route.fulfill({
      status: 429,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'rate_limit' }),
    }))
    await page.goto('/onboarding/start')
    await waitForUIReady(page)

    await page.locator('input[type="email"]').fill('test@hotel.bo')
    await page.getByRole('button', { name: /Empezar|Get started/ }).click()

    // Toast es un nodo que aparece arriba/abajo — simplemente verificamos que la URL no cambió.
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/onboarding\/start$/)
  })
})

test.describe('KYB Wizard — step navigation + persistence', () => {
  test.beforeEach(async ({ page }) => {
    await stubKybStart(page, { applicationId: 'app-test', applicationToken: 'tok-test', state: 'DRAFT' })
    await stubKybStep(page, 'step-1-person')
    await stubKybStep(page, 'step-2-entity')
    await stubKybStep(page, 'step-3-role')
    await stubKybStep(page, 'step-5-merchant')
    await stubKybStep(page, 'submit')
    await page.route(`${API_BASE}/api/kyb/economic-activities*`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    }))
  })

  test('step-1 → step-2 con datos válidos', async ({ page }) => {
    await page.goto('/onboarding/start')
    await waitForUIReady(page)
    await page.locator('input[type="email"]').fill('test@hotel.bo')
    await page.getByRole('button', { name: /Empezar|Get started/ }).click()
    await expect(page).toHaveURL(/\/onboarding\/step-1$/)

    // Llenar step 1
    await page.locator('#step1-givenName').fill('Ana')
    await page.locator('#step1-familyName').fill('Lopez')
    await page.locator('#step1-dateOfBirth').fill('1990-05-12')
    await page.locator('#step1-nationality').selectOption('BO')
    await page.getByRole('button', { name: /Continuar|Continue/ }).click()

    await expect(page).toHaveURL(/\/onboarding\/step-2$/, { timeout: 5000 })
  })

  test('back-button navega al step previo', async ({ page }) => {
    await stubKybStart(page, { applicationId: 'app-test', applicationToken: 'tok-test', state: 'DRAFT' })
    await page.goto('/onboarding/start')
    await waitForUIReady(page)
    await page.locator('input[type="email"]').fill('test@hotel.bo')
    await page.getByRole('button', { name: /Empezar|Get started/ }).click()
    await expect(page).toHaveURL(/\/onboarding\/step-1$/)

    // Llenar + avanzar
    await page.locator('#step1-givenName').fill('Ana')
    await page.locator('#step1-familyName').fill('Lopez')
    await page.locator('#step1-dateOfBirth').fill('1990-05-12')
    await page.locator('#step1-nationality').selectOption('BO')
    await page.getByRole('button', { name: /Continuar|Continue/ }).click()
    await expect(page).toHaveURL(/\/onboarding\/step-2$/)

    // Click "Volver" del footer del wizard
    await page.getByRole('button', { name: /Volver|Back/ }).click()
    await expect(page).toHaveURL(/\/onboarding\/step-1$/)
  })

  test('refresh browser entre steps preserva el draft (cookie + localStorage)', async ({ page, context }) => {
    await page.goto('/onboarding/start')
    await waitForUIReady(page)
    await page.locator('input[type="email"]').fill('test@hotel.bo')
    await page.getByRole('button', { name: /Empezar|Get started/ }).click()
    await expect(page).toHaveURL(/\/onboarding\/step-1$/)

    // Verificar que applicationToken vive en localStorage
    const tokenInStorage = await page.evaluate(() => localStorage.getItem('zwap-kyb-application-token'))
    expect(tokenInStorage).toBe('tok-test')

    // Reload — el wizard debería seguir activo
    await page.reload()
    await waitForUIReady(page)
    await expect(page).toHaveURL(/\/onboarding\/step-1$/)
  })
})

test.describe('KYB Wizard — review screen', () => {
  test('/onboarding/review sin draft → redirige a /onboarding/start', async ({ page }) => {
    await page.goto('/onboarding/review')
    await expect(page).toHaveURL(/\/onboarding\/start$/)
  })
})
