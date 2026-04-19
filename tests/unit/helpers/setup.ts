import { vi, afterEach } from 'vitest'

// happy-dom no implementa matchMedia: shim antes de que cualquier código
// que haga useMediaQuery() corra durante import.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  }) as MediaQueryList
}

// IntersectionObserver — happy-dom no lo implementa por default.
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  class IO {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
    root = null
    rootMargin = ''
    thresholds = []
  }
  // @ts-expect-error test stub
  window.IntersectionObserver = IO
}

// ResizeObserver — usado indirectamente por algunos libs.
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  class RO {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }
  // @ts-expect-error test stub
  window.ResizeObserver = RO
}

// Limpieza entre tests: DOM attrs + storage + pinia state.
afterEach(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    document.body.removeAttribute('data-modal-open')
    document.body.removeAttribute('data-modal-count')
  }
  if (typeof localStorage !== 'undefined') {
    try { localStorage.clear() } catch { /* ok */ }
  }
})
