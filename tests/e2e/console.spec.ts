import { test, expect, waitForUIReady } from './fixtures'

/**
 * Cada ruta principal NO debe generar console.error ni pageerror durante carga inicial.
 * Warnings de vue-i18n (`[intlify]`) por keys faltantes cuentan como error.
 */
const ROUTES_PUBLIC = [
  { path: '/login', name: 'login' },
  { path: '/legal/terminos', name: 'legal-terminos' },
]

const ROUTES_PRIVATE = [
  { path: '/app/dashboard', name: 'dashboard' },
  { path: '/app/transacciones', name: 'transacciones' },
  { path: '/app/links', name: 'links' },
  { path: '/app/liquidaciones', name: 'liquidaciones' },
  { path: '/app/wallet', name: 'wallet' },
  { path: '/app/sucursales', name: 'sucursales' },
  { path: '/app/usuarios', name: 'usuarios' },
  { path: '/app/configuracion', name: 'configuracion' },
]

test.describe('Console: rutas públicas sin errores runtime', () => {
  for (const route of ROUTES_PUBLIC) {
    test(`${route.name} → sin console.error / pageerror`, async ({ page, consoleErrors }) => {
      await page.goto(route.path)
      await waitForUIReady(page)
      expect(consoleErrors).toEqual([])
    })
  }
})

test.describe('Console: rutas privadas sin errores runtime', () => {
  test.beforeEach(async ({ mockAuth }) => {
    await mockAuth()
  })

  for (const route of ROUTES_PRIVATE) {
    test(`${route.name} → sin console.error / pageerror`, async ({ page, consoleErrors }) => {
      await page.goto(route.path)
      await waitForUIReady(page)
      expect(consoleErrors).toEqual([])
    })
  }
})
