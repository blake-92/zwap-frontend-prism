import { test as base, expect, type Page } from '@playwright/test'

type PerfTier = 'full' | 'normal' | 'lite'
type ThemeMode = 'dark' | 'light'
type RoleCode = 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'RECEPTIONIST'
type ActivationLevel = 'NONE' | 'BASIC' | 'FULL'
type KybState = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'MORE_INFO_REQUIRED' | 'GRANDFATHERED'

// Permisos por rol — espejo del catálogo del backend (`GET /api/iam/roles`). Si el backend cambia
// los permisos de un rol, hay que actualizar este map. Mantenerlo acá evita un round-trip al
// backend en cada test E2E offline.
const PERMISSIONS_BY_ROLE: Record<RoleCode, string[]> = {
  OWNER: [
    'ACCOUNT_VIEW_OWN', 'BANK_ACCOUNT_MANAGE', 'BANK_ACCOUNT_VIEW',
    'BRANCHES_MANAGE', 'BRANCHES_VIEW',
    'DASHBOARD_ANALYTICS_VIEW', 'DASHBOARD_OPS_VIEW',
    'LINKS_CREATE', 'LINKS_REVOKE', 'LINKS_VIEW',
    'SETTINGS_BILLING', 'SETTINGS_MERCHANT',
    'SETTLEMENTS_EXPORT', 'SETTLEMENTS_VIEW',
    'TRANSACTIONS_EXPORT', 'TRANSACTIONS_REFUND', 'TRANSACTIONS_VIEW',
    'USERS_INVITE', 'USERS_MANAGE_ROLES', 'USERS_REMOVE', 'USERS_VIEW',
    'WALLET_VIEW', 'WALLET_WITHDRAW',
  ],
  ADMIN: [
    'ACCOUNT_VIEW_OWN', 'BANK_ACCOUNT_VIEW',
    'BRANCHES_MANAGE', 'BRANCHES_VIEW',
    'DASHBOARD_ANALYTICS_VIEW', 'DASHBOARD_OPS_VIEW',
    'LINKS_CREATE', 'LINKS_REVOKE', 'LINKS_VIEW',
    'SETTINGS_MERCHANT',
    'SETTLEMENTS_EXPORT', 'SETTLEMENTS_VIEW',
    'TRANSACTIONS_EXPORT', 'TRANSACTIONS_REFUND', 'TRANSACTIONS_VIEW',
    'USERS_INVITE', 'USERS_MANAGE_ROLES', 'USERS_REMOVE', 'USERS_VIEW',
    'WALLET_VIEW',
  ],
  ACCOUNTANT: [
    'ACCOUNT_VIEW_OWN', 'BANK_ACCOUNT_VIEW',
    'BRANCHES_VIEW',
    'DASHBOARD_ANALYTICS_VIEW',
    'SETTLEMENTS_EXPORT', 'SETTLEMENTS_VIEW',
    'TRANSACTIONS_EXPORT', 'TRANSACTIONS_VIEW',
    'WALLET_VIEW',
  ],
  RECEPTIONIST: [
    'ACCOUNT_VIEW_OWN',
    'BRANCHES_VIEW',
    'DASHBOARD_OPS_VIEW',
    'LINKS_CREATE', 'LINKS_VIEW',
    'TRANSACTIONS_VIEW',
  ],
}

interface MockAuthOptions {
  /** Rol simulado — determina los `permissions[]` inyectados en el stub de /api/account/me.
   *  Default: `OWNER` (compat con tests existentes que llamaban `mockAuth()` sin args). */
  role?: RoleCode
  /** Nivel de activación del merchant (post fase 2). Default: `BASIC` para espejar el seed
   *  del backend (3 hoteles seedeados arrancan en BASIC + GRANDFATHERED). Tests del wizard
   *  KYB usan `NONE`; tests del flow FULL post-aprobación usan `FULL`. */
  activationLevel?: ActivationLevel
  /** Estado del KYB del merchant. Default: `GRANDFATHERED` (seed). Tests del banner "en review"
   *  usan `SUBMITTED|IN_REVIEW`; del MoreInfoRequestedAlert usan `MORE_INFO_REQUIRED`. */
  kybState?: KybState
}

interface ZwapFixtures {
  /** Set el perf tier vía localStorage antes del primer navigate. Reload implícito. */
  setTier: (tier: PerfTier) => Promise<void>
  /** Set el theme mode vía localStorage antes del primer navigate. */
  setTheme: (mode: ThemeMode) => Promise<void>
  /** Inyecta cookie zwap_session + stubs de /me, /branches, /users. Acepta `{ role }` para
   *  simular distintos perfiles de permisos (default: OWNER). */
  mockAuth: (opts?: MockAuthOptions) => Promise<void>
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

  mockAuth: async ({ context, page }, use) => {
    const setter = async (opts: MockAuthOptions = {}) => {
      const role: RoleCode = opts.role ?? 'OWNER'
      const permissions = PERMISSIONS_BY_ROLE[role]
      const activationLevel: ActivationLevel = opts.activationLevel ?? 'BASIC'
      const kybState: KybState = opts.kybState ?? 'GRANDFATHERED'

      // Cookie zwap_session — flag no-httpOnly que el middleware auth lee para gating.
      await context.addCookies([{
        name: 'zwap_session',
        value: '1',
        domain: 'localhost',
        path: '/',
        sameSite: 'Lax',
      }])

      // El plugin session.client.js dispara GET /api/account/me al boot. El layout dispara
      // GET /api/branches cuando isAuthenticated es true. Sin backend real (E2E offline)
      // estas requests fallan con NETWORK_ERROR y el plugin throwea — bloqueando el mount.
      // Stubeamos respuestas sintéticas mínimas para que la UI hidrate sin tocar backend.
      const apiBase = 'http://localhost:8080'
      await page.route(`${apiBase}/api/account/me`, (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'mock-user', email: 'mock@hoteldesal.bo', fullName: 'Mock User' },
          merchant: { id: 'mock-merchant', businessName: 'Hotel de Sal', activationLevel, kybState },
          permissions,
        }),
      }))
      await page.route(`${apiBase}/api/branches`, (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'mock-branch-1', name: 'Sucursal Principal', code: 'PRI', isPrimary: true, status: 'ACTIVE', createdAt: '2026-04-30T00:00:00Z', updatedAt: '2026-04-30T00:00:00Z' },
          { id: 'mock-branch-2', name: 'Sucursal Madera', code: 'MAD', isPrimary: false, status: 'ACTIVE', createdAt: '2026-04-30T00:00:00Z', updatedAt: '2026-04-30T00:00:00Z' },
        ]),
      }))
      await page.route(`${apiBase}/api/users`, (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'mock-user-1', email: 'owner@hoteldesal.bo', fullName: 'Juan Pérez', status: 'ACTIVE', lastLoginAt: '2026-05-01T00:00:00Z', createdAt: '2026-04-30T00:00:00Z', roles: [{ roleCode: 'OWNER', branchId: null }] },
          { id: 'mock-user-2', email: 'recepcion@hoteldesal.bo', fullName: 'María Quispe', status: 'PENDING_INVITE', lastLoginAt: null, createdAt: '2026-04-30T00:00:00Z', roles: [{ roleCode: 'RECEPTIONIST', branchId: 'mock-branch-1' }] },
        ]),
      }))
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
