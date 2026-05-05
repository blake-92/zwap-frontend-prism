import { test, expect, waitForUIReady } from './fixtures'
import type { Page, Route } from '@playwright/test'

// E2E del flow Profile FULL post-aprobación BASIC. Verifica:
//   - Render del wizard 3-step (KYC → KYB → Business Profile)
//   - Banner global del KYB se inyecta cuando merchant.kybState === SUBMITTED|IN_REVIEW|MORE_INFO_REQUIRED|REJECTED
//   - Lock indicators en Sidebar/BottomNav cuando activationLevel === BASIC
//   - RECEPTIONIST puede VER profile-full pero ve el read-only banner en steps KYB/Business
//
// Convención: stubeamos /api/account/profile* para no tocar backend en E2E.

const API = 'http://localhost:8080'

function buildProfile(overrides: Record<string, unknown> = {}) {
  return {
    person: {
      id: 'person-1',
      givenName: 'Mock',
      familyName: 'User',
      dateOfBirth: '1990-01-01',
      nationality: 'BO',
      isPep: false,
      isPepRelated: false,
    },
    legalEntities: [
      {
        id: 'ent-1',
        legalName: 'Hotel de Sal SRL',
        jurisdiction: 'BO',
        primary: true,
      },
    ],
    ...overrides,
  }
}

async function stubProfile(page: Page, profile: Record<string, unknown>) {
  await page.route(`${API}/api/account/profile`, (route: Route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify(profile),
  }))
}

async function stubBusinessProfile(page: Page, bp: Record<string, unknown> | { status: 404 }) {
  await page.route(`${API}/api/account/profile/business-profile`, (route: Route) => {
    if ('status' in bp && bp.status === 404) {
      return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'NOT_FOUND' }) })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(bp) })
  })
}

test.describe('ProfileFull — render + permission gating', () => {
  test('OWNER en BASIC: page carga el stepper y arranca en step 1 (KYC)', async ({ page, mockAuth }) => {
    await mockAuth({ role: 'OWNER', activationLevel: 'BASIC', kybState: 'APPROVED' })
    await stubProfile(page, buildProfile())
    await stubBusinessProfile(page, { status: 404 })

    await page.goto('/app/profile-full')
    await waitForUIReady(page)

    // Header de la page
    // Match ES "Completar perfil" o EN "Complete your profile" (locale auto-detect)
    await expect(page.getByRole('heading', { level: 1, name: /completar perfil|complete (your )?profile/i })).toBeVisible()
    // Step 1 inputs visibles (KYC)
    await expect(page.locator('#kyc-street')).toBeVisible()
    await expect(page.locator('#kyc-country')).toBeVisible()
    // El banner global del KYB NO se renderea en /app/profile-full (la propia vista lo maneja interno)
    await expect(page.getByRole('region', { name: /review/i })).toHaveCount(0)
  })

  test('RECEPTIONIST puede VER profile-full pero recibe read-only banner en step 2', async ({ page, mockAuth }) => {
    // RECEPTIONIST no tiene SETTINGS_MERCHANT — backend impone real (403). Frontend muestra
    // readonly UI y banner Lock. La page carga (no redirige) porque queremos que el user vea
    // su propio progreso aunque no edite.
    await mockAuth({ role: 'RECEPTIONIST', activationLevel: 'BASIC', kybState: 'APPROVED' })
    await stubProfile(page, buildProfile())
    await stubBusinessProfile(page, { status: 404 })

    await page.goto('/app/profile-full')
    await waitForUIReady(page)
    await expect(page).toHaveURL(/\/app\/profile-full/)

    // Submit step 1 con datos válidos para avanzar a step 2
    await page.locator('#kyc-street').fill('Av. X')
    await page.locator('#kyc-city').fill('La Paz')
    await page.locator('#kyc-country').selectOption('BO')

    // Stub PATCH person — necesario para que el handleKycSubmit no falle
    await page.route(`${API}/api/account/profile/person`, (route: Route) => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }),
    }))

    // El botón "Save and continue" / "Guardar y continuar" — match EN o ES
    await page.getByRole('button', { name: /save and continue|guardar y continuar/i }).first().click()

    // Read-only banner aparece en step 2 (KYB) cuando !canEditMerchant. Copy ES/EN.
    await expect(page.getByText(/solo lectura|view.?only|read.?only/i).first()).toBeVisible({ timeout: 8000 })
  })
})

test.describe('Global KYB banner — layout-level', () => {
  test('kybState=IN_REVIEW: banner aparece en /app/dashboard', async ({ page, mockAuth }) => {
    await mockAuth({ role: 'OWNER', activationLevel: 'BASIC', kybState: 'IN_REVIEW' })
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    // ReviewBanner contiene texto "revisión|review" en el copy de KYB.banner.
    await expect(page.getByText(/revisi[oó]n|review/i).first()).toBeVisible()
  })

  test('kybState=APPROVED: banner NO aparece', async ({ page, mockAuth }) => {
    await mockAuth({ role: 'OWNER', activationLevel: 'FULL', kybState: 'APPROVED' })
    await page.goto('/app/dashboard')
    await waitForUIReady(page)
    // No banner KYB — copy específico ausente
    const banner = page.locator('text=/Tu cuenta est[aá] en revisi[oó]n|under review/i')
    await expect(banner).toHaveCount(0)
  })

  test('kybState=IN_REVIEW en /app/profile-full: el banner GLOBAL no se renderea (la vista lo maneja interno)', async ({ page, mockAuth }) => {
    await mockAuth({ role: 'OWNER', activationLevel: 'BASIC', kybState: 'IN_REVIEW' })
    await stubProfile(page, buildProfile())
    await stubBusinessProfile(page, { status: 404 })

    await page.goto('/app/profile-full')
    await waitForUIReady(page)

    // Solo debería haber UN banner — el de la vista, no el global. Heurística: contar elementos
    // que matchean el texto "revisión|review" en headers de banner.
    const banners = page.locator('section header p:has-text("revisión"), section header p:has-text("review")')
    const count = await banners.count()
    expect(count).toBeLessThanOrEqual(1)
  })
})

test.describe('BASIC lock indicators — Sidebar/BottomNav', () => {
  test('Desktop OWNER+BASIC: sidebar items locked tienen aria-disabled + redirigen a profile-full', async ({ page, viewport, mockAuth }) => {
    test.skip(!viewport || viewport.width < 1024, 'Sidebar visible solo en desktop')
    await mockAuth({ role: 'OWNER', activationLevel: 'BASIC', kybState: 'APPROVED' })
    await page.goto('/app/dashboard')
    await waitForUIReady(page)

    const sidebar = page.locator('aside').first()
    const linksBtn = sidebar.getByRole('button', { name: /links/i }).first()
    await expect(linksBtn).toHaveAttribute('aria-disabled', 'true')

    // Click → redirige a /app/profile-full (no a /app/links). force=true porque aria-disabled
    // hace que Playwright lo trate como "not enabled" pero el handler aún corre y redirige.
    await linksBtn.click({ force: true })
    await expect(page).toHaveURL(/\/app\/profile-full/)
  })

  test('Desktop OWNER+FULL: sidebar items NO tienen aria-disabled', async ({ page, viewport, mockAuth }) => {
    test.skip(!viewport || viewport.width < 1024, 'Sidebar visible solo en desktop')
    await mockAuth({ role: 'OWNER', activationLevel: 'FULL', kybState: 'APPROVED' })
    await page.goto('/app/dashboard')
    await waitForUIReady(page)

    const sidebar = page.locator('aside').first()
    const linksBtn = sidebar.getByRole('button', { name: /links/i }).first()
    // Cuando NO está locked, el aria-disabled no se setea
    await expect(linksBtn).not.toHaveAttribute('aria-disabled', 'true')
  })

  test('Mobile OWNER+BASIC: bottomnav tabs locked tienen aria-disabled', async ({ page, viewport, mockAuth }) => {
    test.skip(!viewport || viewport.width >= 1024, 'BottomNav visible solo en mobile/tablet')
    await mockAuth({ role: 'OWNER', activationLevel: 'BASIC', kybState: 'APPROVED' })
    await page.goto('/app/dashboard')
    await waitForUIReady(page)

    const nav = page.locator('nav.fixed.bottom-0').first()
    // Transacciones tab debería estar locked
    const txBtn = nav.getByRole('button', { name: /transac/i }).first()
    await expect(txBtn).toHaveAttribute('aria-disabled', 'true')

    // Click → redirige a /app/profile-full. force=true por el aria-disabled.
    await txBtn.click({ force: true })
    await expect(page).toHaveURL(/\/app\/profile-full/)
  })
})
