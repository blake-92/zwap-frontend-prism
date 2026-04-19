import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '~/stores/theme'

describe('theme store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.classList.remove('dark')
    try { localStorage.clear() } catch {}
  })

  it('estado inicial: isDarkMode=false, no hidratado', () => {
    const store = useThemeStore()
    expect(store.isDarkMode).toBe(false)
    expect(store._hydrated).toBe(false)
  })

  describe('hydrate', () => {
    it('sin localStorage: usa prefers-color-scheme', () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true, // prefers dark
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList)
      const store = useThemeStore()
      store.hydrate()
      expect(store.isDarkMode).toBe(true)
      expect(store._hydrated).toBe(true)
    })

    it('con localStorage="dark": lee persisted', () => {
      localStorage.setItem('zwap-theme', 'dark')
      const store = useThemeStore()
      store.hydrate()
      expect(store.isDarkMode).toBe(true)
    })

    it('con localStorage="light": lee persisted', () => {
      localStorage.setItem('zwap-theme', 'light')
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(), removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList)
      const store = useThemeStore()
      store.hydrate()
      expect(store.isDarkMode).toBe(false) // localStorage gana sobre matchMedia
    })

    it('idempotente: segundo hydrate no cambia estado', () => {
      localStorage.setItem('zwap-theme', 'dark')
      const store = useThemeStore()
      store.hydrate()
      store.isDarkMode = false
      store.hydrate() // no-op porque _hydrated
      expect(store.isDarkMode).toBe(false)
    })
  })

  describe('apply', () => {
    it('dark mode: agrega clase `dark` al html + persiste', () => {
      const store = useThemeStore()
      store.isDarkMode = true
      store.apply()
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(localStorage.getItem('zwap-theme')).toBe('dark')
    })

    it('light mode: remueve clase `dark` + persiste "light"', () => {
      document.documentElement.classList.add('dark')
      const store = useThemeStore()
      store.isDarkMode = false
      store.apply()
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(localStorage.getItem('zwap-theme')).toBe('light')
    })
  })

  describe('toggleTheme', () => {
    it('flipea isDarkMode + aplica', () => {
      const store = useThemeStore()
      expect(store.isDarkMode).toBe(false)
      store.toggleTheme()
      expect(store.isDarkMode).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      store.toggleTheme()
      expect(store.isDarkMode).toBe(false)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('localStorage resilience (Safari private / quota)', () => {
    it('getItem que lanza: no explota, usa fallback', () => {
      const orig = Storage.prototype.getItem
      Storage.prototype.getItem = vi.fn(() => { throw new Error('denied') })
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList)
      const store = useThemeStore()
      expect(() => store.hydrate()).not.toThrow()
      expect(store._hydrated).toBe(true)
      Storage.prototype.getItem = orig
    })

    it('setItem que lanza: no explota', () => {
      const orig = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => { throw new Error('quota') })
      const store = useThemeStore()
      store.isDarkMode = true
      expect(() => store.apply()).not.toThrow()
      Storage.prototype.setItem = orig
    })
  })
})
