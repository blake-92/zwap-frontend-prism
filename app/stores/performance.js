import { defineStore } from 'pinia'

const STORAGE_KEY = 'zwap-perf'
const TIERS = ['full', 'lite', 'minimal']

function detectTier() {
  if (typeof window === 'undefined') return 'full'

  // prefers-reduced-motion → minimal
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'minimal'

  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory // Chrome-only, undefined elsewhere

  // Very low-end: < 2 cores or < 2GB RAM
  if (cores < 2 || (memory && memory < 2)) return 'minimal'

  // Low-end: < 4 cores, or < 4GB RAM, or mobile with low specs
  if (cores < 4 || (memory && memory < 4)) return 'lite'

  return 'full'
}

export const usePerformanceStore = defineStore('performance', {
  state: () => ({
    tier: 'full',
    _hydrated: false,
  }),
  getters: {
    isLite: (s) => s.tier === 'lite' || s.tier === 'minimal',
    isMinimal: (s) => s.tier === 'minimal',
    useBlur: (s) => s.tier === 'full',
    useSpring: (s) => s.tier !== 'minimal',
  },
  actions: {
    hydrate() {
      if (this._hydrated || typeof window === 'undefined') return
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && TIERS.includes(stored)) {
        this.tier = stored
      } else {
        this.tier = detectTier()
      }
      this._hydrated = true
      this.apply()
    },
    setTier(tier) {
      if (!TIERS.includes(tier)) return
      this.tier = tier
      localStorage.setItem(STORAGE_KEY, tier)
      this.apply()
    },
    apply() {
      if (typeof document === 'undefined') return
      const el = document.documentElement
      TIERS.forEach((t) => el.classList.remove(`perf-${t}`))
      el.classList.add(`perf-${this.tier}`)
    },
  },
})
