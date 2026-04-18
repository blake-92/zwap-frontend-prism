import { defineStore } from 'pinia'

/**
 * Performance tier system — 3 niveles.
 *
 *   - full    → "Prism" — todos los efectos (desktop/flagships)
 *   - normal  → mid-range común (iPhone XR-14, Galaxy A5x, Pixel 5-6)
 *   - lite    → low-end (Samsung A15, 4GB RAM) + prefers-reduced-motion
 *
 * Identidad preservada en todos los tiers:
 *   morado, tipografía, rounded, spring physics, layout-id morphs, dark/light,
 *   bolas púrpura de fondo (con blur decreciente), drag gestures.
 *
 * Tiered:
 *   useBlur           → glassmorphism backdrop-blur (reducido en normal, off en lite)
 *   useDecorBg        → bolas púrpura (siempre, radio decreciente via tier directo)
 *   useNeon           → glows de color en buttons/toggles/stepper  [full]
 *   useDeepShadows    → shadows masivos (modales, hover card)      [full, normal]
 *   useContinuousAnim → loops infinitos (pulse, shimmer, bell)     [full, normal]
 *   useHoverLift      → card hover -translate-y-1                  [full, normal]
 *   useInnerHighlight → border-t decorativo (glass top)            [full, normal]
 *   useDecorGradients → gradientes sutiles                         [full, normal, lite]
 *   useSpring         → motion-v springs                           [todos]
 *   useLayoutMorphs   → motion-v layout-id                         [todos]
 */

const STORAGE_KEY = 'zwap-perf'
const TIERS = ['full', 'normal', 'lite']

function detectTier() {
  if (typeof window === 'undefined') return 'full'

  // prefers-reduced-motion → lite (CSS @media también desactiva animations globalmente)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'lite'

  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory // Chrome-only

  const isTouch = window.matchMedia('(pointer: coarse)').matches
                && window.matchMedia('(hover: none)').matches
  const isMobileUA = navigator.userAgentData?.mobile === true

  // Very low-end → lite
  if (cores < 4 || (memory && memory < 4)) return 'lite'

  // Mid-range: touch, o 8 cores con ≤6GB RAM, o mobile UA
  if (cores < 8 || (memory && memory < 6) || isMobileUA || (isTouch && !memory)) return 'normal'

  return 'full'
}

export const usePerformanceStore = defineStore('performance', {
  state: () => ({
    tier: 'full',
    _hydrated: false,
  }),
  getters: {
    isFull:   (s) => s.tier === 'full',
    isNormal: (s) => s.tier === 'normal',
    isLite:   (s) => s.tier === 'lite',

    // GPU
    useBlur:             (s) => s.tier === 'full' || s.tier === 'normal',
    useReducedBlur:      (s) => s.tier === 'normal',
    useNeon:             (s) => s.tier === 'full',
    useInnerHighlight:   (s) => s.tier === 'full' || s.tier === 'normal',
    useWalletGlowBubble: (s) => s.tier === 'full' || s.tier === 'normal',
    // Glass elevation: specular gradient + rim light (border-l) + dual-source shadow.
    // Solo en Prism — upgrade del glass de "plano" a "cristal con grosor".
    useGlassElevation:   (s) => s.tier === 'full',
    // Halo ambiental detrás del pill activo (sidebar/bottomnav/segment) — solo Prism.
    useActiveHalo:       (s) => s.tier === 'full',
    // Saturate filter costoso — solo en Prism (el blur ya está en todos los que usan glass)
    chromeSaturate:      (s) => s.tier === 'full',
    // 3-way shadow level para modales/dropdowns: Prism cinemático, Normal medio, Lite compacto
    modalShadow:         (s) => s.tier === 'full' ? 'deep' : s.tier === 'normal' ? 'medium' : 'compact',
    // Backdrop filter del modal (ojo: pesa por frame durante el fade). String de clases Tailwind.
    // Prism: saturate-175 (12% menos GPU que 200, diferencia visual imperceptible).
    // Normal: solo blur reducido, saturate compounding removido.
    // Lite: vacío (CSS strip).
    modalBackdropFilter: (s) => s.tier === 'full'
      ? 'backdrop-blur-md backdrop-saturate-175'
      : s.tier === 'normal'
        ? 'backdrop-blur-sm'
        : '',

    // Animaciones
    useSpring:         () => true, // springs son CPU-cheap, se mantienen
    useLayoutMorphs:   () => true, // QR expand y similares (acción-disparados): siempre
    useNavMorphs:      (s) => s.tier === 'full' || s.tier === 'normal', // pill del sidebar/bottomnav/segment: instant en lite
    useContinuousAnim: (s) => s.tier === 'full' || s.tier === 'normal',

    // Interacciones
    useHoverLift:      (s) => s.tier === 'full' || s.tier === 'normal',
    useDecorGradients: () => true, // gradients baratos de pintar
  },
  actions: {
    hydrate() {
      if (this._hydrated || typeof window === 'undefined') return
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && TIERS.includes(stored)) {
        this.tier = stored
      } else {
        // Valor inválido heredado (ej: 'minimal' previo) — re-detect y limpia
        if (stored) localStorage.removeItem(STORAGE_KEY)
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
      // Limpia clases viejas (full/normal/lite/minimal si heredado)
      ;['full', 'normal', 'lite', 'minimal'].forEach((t) => el.classList.remove(`perf-${t}`))
      el.classList.add(`perf-${this.tier}`)
    },
  },
})
