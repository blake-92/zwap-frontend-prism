import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useMediaQuery } from '~/composables/useMediaQuery'
import { withSetup } from '../helpers/withSetup'

interface FakeMQL {
  matches: boolean
  media: string
  _listeners: Array<(e: { matches: boolean }) => void>
  addEventListener: (t: string, fn: (e: { matches: boolean }) => void) => void
  removeEventListener: (t: string, fn: (e: { matches: boolean }) => void) => void
  _fire: (matches: boolean) => void
}

let mqlFactory: (query: string) => FakeMQL
let mqls: FakeMQL[] = []

beforeEach(() => {
  mqls = []
  mqlFactory = (query: string) => {
    const mql: FakeMQL = {
      matches: false,
      media: query,
      _listeners: [],
      addEventListener: (_t, fn) => { mql._listeners.push(fn) },
      removeEventListener: (_t, fn) => {
        const i = mql._listeners.indexOf(fn)
        if (i >= 0) mql._listeners.splice(i, 1)
      },
      _fire: (matches) => {
        mql.matches = matches
        mql._listeners.forEach(l => l({ matches }))
      },
    }
    mqls.push(mql)
    return mql
  }
  window.matchMedia = vi.fn((query: string) => mqlFactory(query) as unknown as MediaQueryList)
})

afterEach(() => {
  mqls = []
})

describe('useMediaQuery', () => {
  it('inicializa con matches = false cuando matchMedia no matchea', () => {
    const { result, unmount } = withSetup(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.value).toBe(false)
    unmount()
  })

  it('inicializa con matches = true cuando matchMedia matchea sincrónicamente', () => {
    // Override factory para que el primer MQL matchee
    const origFactory = mqlFactory
    mqlFactory = (q) => { const m = origFactory(q); m.matches = true; return m }
    const { result, unmount } = withSetup(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.value).toBe(true)
    unmount()
  })

  it('actualiza cuando cambia el media query', () => {
    const { result, unmount } = withSetup(() => useMediaQuery('(min-width: 1024px)'))
    expect(result.value).toBe(false)
    // mqls[0] corresponde al init sync; mqls[1] al setup() en onMounted. Usamos el más reciente.
    const mql = mqls[mqls.length - 1]
    mql._fire(true)
    expect(result.value).toBe(true)
    mql._fire(false)
    expect(result.value).toBe(false)
    unmount()
  })

  it('remueve listener en onUnmounted', () => {
    const { unmount } = withSetup(() => useMediaQuery('(min-width: 1024px)'))
    const mql = mqls[mqls.length - 1]
    expect(mql._listeners.length).toBe(1)
    unmount()
    expect(mql._listeners.length).toBe(0)
  })

  it('acepta función getter reactiva como query', () => {
    const { result, unmount } = withSetup(() => useMediaQuery(() => '(max-width: 639px)'))
    expect(result.value).toBeDefined()
    unmount()
  })
})
