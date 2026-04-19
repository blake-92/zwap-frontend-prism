import { describe, it, expect } from 'vitest'
import { ROUTES, isSafeInternalPath } from '~/utils/routes'

describe('ROUTES constants', () => {
  it('tiene todas las rutas privadas bajo /app', () => {
    const privateKeys = ['DASHBOARD', 'TRANSACTIONS', 'LINKS', 'SETTLEMENTS', 'WALLET', 'BRANCHES', 'USERS', 'SETTINGS']
    for (const key of privateKeys) {
      expect(ROUTES[key as keyof typeof ROUTES]).toMatch(/^\/app\//)
    }
  })

  it('LOGIN y APP siguen siendo públicos/root', () => {
    expect(ROUTES.LOGIN).toBe('/login')
    expect(ROUTES.APP).toBe('/app')
  })
})

describe('isSafeInternalPath — open-redirect prevention', () => {
  describe('acepta paths internos válidos', () => {
    it.each([
      '/login',
      '/app/dashboard',
      '/legal/terminos',
      '/app/wallet?foo=bar',
      '/app/transacciones#section',
      '/',
    ])('acepta %s', (p) => {
      expect(isSafeInternalPath(p)).toBe(true)
    })
  })

  describe('rechaza protocolo-relativo (//host)', () => {
    it.each([
      '//evil.com',
      '//evil.com/app/dashboard',
      '//evil.com/fake-login',
    ])('rechaza %s', (p) => {
      expect(isSafeInternalPath(p)).toBe(false)
    })
  })

  describe('rechaza backslash-escape bypass (/\\path)', () => {
    it.each([
      '/\\evil.com',
      '/\\\\evil.com',
    ])('rechaza %s', (p) => {
      expect(isSafeInternalPath(p)).toBe(false)
    })
  })

  describe('rechaza URLs absolutas', () => {
    it.each([
      'https://evil.com',
      'http://evil.com/app/dashboard',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'ftp://evil.com',
    ])('rechaza %s', (p) => {
      expect(isSafeInternalPath(p)).toBe(false)
    })
  })

  describe('rechaza non-strings', () => {
    it.each([null, undefined, 123, {}, [], true, false])('rechaza %s', (p) => {
      expect(isSafeInternalPath(p as unknown as string)).toBe(false)
    })
  })

  it('rechaza string vacío', () => {
    expect(isSafeInternalPath('')).toBe(false)
  })

  it('rechaza paths sin slash inicial', () => {
    expect(isSafeInternalPath('login')).toBe(false)
    expect(isSafeInternalPath('app/dashboard')).toBe(false)
  })
})
