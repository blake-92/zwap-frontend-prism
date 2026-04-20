import { test, expect, waitForUIReady } from './fixtures'

/**
 * Smoke test para documentos legales oficiales.
 * Valida que las 3 rutas públicas renderizan:
 *   - h1 (título del doc)
 *   - TOC sticky (data-legal-toc)
 *   - al menos una sección con id
 *   - footer con "Volver al inicio"
 * Sin errores de consola.
 */

const DOCS = [
  { slug: 'terminos', titleRe: /Términos y Condiciones|Terms and Conditions/i },
  { slug: 'privacidad', titleRe: /Política de Privacidad|Privacy Policy/i },
  { slug: 'copyright', titleRe: /Copyright/i },
]

for (const doc of DOCS) {
  test(`legal/${doc.slug}: renderiza header + toc + secciones sin errores`, async ({ page, consoleErrors }) => {
    await page.goto(`/legal/${doc.slug}`)
    await waitForUIReady(page)

    // Título del doc
    await expect(page.locator('h1').first()).toContainText(doc.titleRe)

    // TOC sticky presente
    await expect(page.locator('[data-legal-toc]')).toBeVisible()

    // Al menos una sección con id renderizada
    await expect(page.locator('section[id]').first()).toBeVisible()

    // Footer con back-to-top
    await expect(page.getByRole('button', { name: /Volver al inicio|Back to top/i })).toBeVisible()

    expect(consoleErrors).toEqual([])
  })
}

test('login footer: 3 links legales navegan correctamente', async ({ page, consoleErrors }) => {
  await page.goto('/login')
  await waitForUIReady(page)

  // Terminos
  await page.getByRole('link', { name: /Términos de Uso|Terms of Use/i }).click()
  await expect(page).toHaveURL(/\/legal\/terminos/)
  await page.goBack()

  // Privacidad
  await page.getByRole('link', { name: /Privacidad|Privacy/i }).click()
  await expect(page).toHaveURL(/\/legal\/privacidad/)
  await page.goBack()

  // Copyright
  await page.getByRole('link', { name: /^Copyright$/ }).click()
  await expect(page).toHaveURL(/\/legal\/copyright/)

  expect(consoleErrors).toEqual([])
})

test('legal TOC: click en item scrollea a la sección', async ({ page }) => {
  await page.goto('/legal/terminos')
  await waitForUIReady(page)

  // Click en un item del TOC que no sea el primero
  await page.locator('[data-legal-toc] a[href="#definiciones"]').click()
  await page.waitForTimeout(500) // espera scroll smooth

  const section = page.locator('section#definiciones')
  await expect(section).toBeVisible()

  // La sección debe estar cerca del top (scrollY avanzó)
  const scrollY = await page.evaluate(() => window.scrollY)
  expect(scrollY).toBeGreaterThan(100)
})
