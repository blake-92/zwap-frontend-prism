import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePerformanceStore } from '~/stores/performance'

// Helpers para mockear APIs del browser usadas en detectTier().
interface NavigatorOverrides {
  hardwareConcurrency?: number
  deviceMemory?: number
  userAgentData?: { mobile: boolean } | null
}
const setNavigator = (overrides: NavigatorOverrides) => {
  // Full replacement — no merge con window.navigator previo para evitar leakage
  // entre tests (ej: userAgentData seteado en un test contamina el siguiente).
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'test',
      hardwareConcurrency: overrides.hardwareConcurrency,
      deviceMemory: overrides.deviceMemory,
      userAgentData: overrides.userAgentData ?? undefined,
    },
    writable: true,
    configurable: true,
  })
}
interface MatchMediaRules { [query: string]: boolean }
const setMatchMedia = (rules: MatchMediaRules) => {
  window.matchMedia = vi.fn((q: string) => ({
    matches: rules[q] ?? false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as MediaQueryList)
}

describe('performance store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.documentElement.classList.remove('perf-full', 'perf-normal', 'perf-lite')
    try { localStorage.clear() } catch {}
  })

  it('estado inicial: tier=full, no hidratado', () => {
    const s = usePerformanceStore()
    expect(s.tier).toBe('full')
    expect(s._hydrated).toBe(false)
  })

  describe('getters por tier', () => {
    it('tier=full activa todo GPU', () => {
      const s = usePerformanceStore()
      s.tier = 'full'
      expect(s.isFull).toBe(true)
      expect(s.useBlur).toBe(true)
      expect(s.useNeon).toBe(true)
      expect(s.useGlassElevation).toBe(true)
      expect(s.useActiveHalo).toBe(true)
      expect(s.chromeSaturate).toBe(true)
      expect(s.useHoverLift).toBe(true)
      expect(s.useContinuousAnim).toBe(true)
      expect(s.modalShadow).toBe('deep')
    })

    it('tier=normal mantiene identidad sin excesos (blur ON, neon OFF)', () => {
      const s = usePerformanceStore()
      s.tier = 'normal'
      expect(s.isNormal).toBe(true)
      expect(s.useBlur).toBe(true)
      expect(s.useReducedBlur).toBe(true)
      expect(s.useNeon).toBe(false)
      expect(s.useGlassElevation).toBe(false)
      expect(s.useHoverLift).toBe(true)
      expect(s.useContinuousAnim).toBe(true)
      expect(s.modalShadow).toBe('medium')
    })

    it('tier=lite desactiva casi todo GPU', () => {
      const s = usePerformanceStore()
      s.tier = 'lite'
      expect(s.isLite).toBe(true)
      expect(s.useBlur).toBe(false)
      expect(s.useNeon).toBe(false)
      expect(s.useGlassElevation).toBe(false)
      expect(s.useHoverLift).toBe(false)
      expect(s.useContinuousAnim).toBe(false)
      expect(s.useNavMorphs).toBe(false)
      expect(s.modalShadow).toBe('compact')
      expect(s.modalBackdropFilter).toBe('')
    })

    it('useSpring/useLayoutMorphs/useDecorGradients: siempre true (cheap effects)', () => {
      const s = usePerformanceStore()
      for (const t of ['full', 'normal', 'lite']) {
        s.tier = t
        expect(s.useSpring).toBe(true)
        expect(s.useLayoutMorphs).toBe(true)
        expect(s.useDecorGradients).toBe(true)
      }
    })
  })

  describe('setTier', () => {
    it('setea tier válido + persiste + aplica clase html', () => {
      const s = usePerformanceStore()
      s.setTier('lite')
      expect(s.tier).toBe('lite')
      expect(localStorage.getItem('zwap-perf')).toBe('lite')
      expect(document.documentElement.classList.contains('perf-lite')).toBe(true)
    })

    it('rechaza tier inválido (no cambia nada)', () => {
      const s = usePerformanceStore()
      s.setTier('invalid' as never)
      expect(s.tier).toBe('full')
    })

    it('setTier limpia clases previas (toggle correcto)', () => {
      const s = usePerformanceStore()
      s.setTier('full')
      expect(document.documentElement.classList.contains('perf-full')).toBe(true)
      s.setTier('lite')
      expect(document.documentElement.classList.contains('perf-full')).toBe(false)
      expect(document.documentElement.classList.contains('perf-lite')).toBe(true)
    })
  })

  describe('hydrate + detectTier()', () => {
    afterEach(() => {
      // Restore navigator a un default neutro para que no contamine tests siguientes
      setNavigator({ hardwareConcurrency: 8 })
    })

    it('localStorage válido gana sobre detectTier', () => {
      localStorage.setItem('zwap-perf', 'lite')
      setNavigator({ hardwareConcurrency: 16, deviceMemory: 32 }) // high-end
      setMatchMedia({})
      const s = usePerformanceStore()
      s.hydrate()
      expect(s.tier).toBe('lite')
    })

    it('localStorage inválido se borra + usa detectTier', () => {
      localStorage.setItem('zwap-perf', 'bogus')
      setNavigator({ hardwareConcurrency: 16, deviceMemory: 32 })
      setMatchMedia({})
      const s = usePerformanceStore()
      s.hydrate()
      expect(s.tier).toBe('full')
      expect(localStorage.getItem('zwap-perf')).toBeNull()
    })

    it('detectTier: prefers-reduced-motion → lite', () => {
      setMatchMedia({ '(prefers-reduced-motion: reduce)': true })
      setNavigator({ hardwareConcurrency: 16, deviceMemory: 32 })
      const s = usePerformanceStore()
      s.hydrate()
      expect(s.tier).toBe('lite')
    })

    it('detectTier: cores < 4 → lite', () => {
      setMatchMedia({})
      setNavigator({ hardwareConcurrency: 2, deviceMemory: 8 })
      const s = usePerformanceStore()
      s.hydrate()
      expect(s.tier).toBe('lite')
    })

    it('detectTier: memory < 4GB → lite', () => {
      setMatchMedia({})
      setNavigator({ hardwareConcurrency: 8, deviceMemory: 2 })
      const s = usePerformanceStore()
      s.hydrate()
      expect(s.tier).toBe('lite')
    })

    it('detectTier: cores < 8 → normal', () => {
      setMatchMedia({})
      setNavigator({ hardwareConcurrency: 6, deviceMemory: 8 })
      const s = usePerformanceStore()
      s.hydrate()
      expect(s.tier).toBe('normal')
    })

    it('detectTier: memory < 6 → normal', () => {
      setMatchMedia({})
      setNavigator({ hardwareConcurrency: 8, deviceMemory: 4 })
      const s = usePerformanceStore()
      s.hydrate()
      expect(s.tier).toBe('normal')
    })

    it('detectTier: mobile UA → normal', () => {
      setMatchMedia({})
      setNavigator({ hardwareConcurrency: 8, deviceMemory: 8, userAgentData: { mobile: true } })
      const s = usePerformanceStore()
      s.hydrate()
      expect(s.tier).toBe('normal')
    })

    it('detectTier: cores≥8 + memory≥6 + no mobile → full', () => {
      setMatchMedia({})
      setNavigator({ hardwareConcurrency: 16, deviceMemory: 16 })
      const s = usePerformanceStore()
      s.hydrate()
      expect(s.tier).toBe('full')
    })

    it('hydrate idempotente (segundo call es no-op)', () => {
      localStorage.setItem('zwap-perf', 'lite')
      setMatchMedia({})
      const s = usePerformanceStore()
      s.hydrate()
      s.tier = 'full'
      s.hydrate()
      expect(s.tier).toBe('full') // no fue re-hydrated
    })
  })
})
