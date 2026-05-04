import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { withSetup } from '../helpers/withSetup'

// Mock api.refreshSession ANTES de importar el composable.
// El composable importa `refreshSession` directo de `~/utils/api`, así que mockear el módulo
// nos da control total sobre cuántas veces se llamó y qué resuelve.
const refreshSessionMock = vi.fn().mockResolvedValue(true)
vi.mock('~/utils/api', () => ({
  refreshSession: () => refreshSessionMock(),
}))

// useCookie auto-import — devolvemos un objeto reactivo simple cuyo `.value` controlamos
// por test para simular zwap_session presente / ausente.
const sessionCookie: { value: unknown } = { value: '1' }
vi.stubGlobal('useCookie', vi.fn(() => sessionCookie))

const { useSessionRefresh } = await import('~/composables/useSessionRefresh')

const REFRESH_INTERVAL_MS = 13 * 60 * 1000

describe('useSessionRefresh — timer proactivo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    refreshSessionMock.mockClear()
    sessionCookie.value = '1'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('start onMounted: NO refresca inmediatamente, espera 13 min', async () => {
    const { unmount } = withSetup(() => useSessionRefresh())
    expect(refreshSessionMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS - 1000)
    expect(refreshSessionMock).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(2000)
    expect(refreshSessionMock).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('refresca cada 13 min mientras el componente vive', async () => {
    const { unmount } = withSetup(() => useSessionRefresh())

    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)
    expect(refreshSessionMock).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)
    expect(refreshSessionMock).toHaveBeenCalledTimes(2)

    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)
    expect(refreshSessionMock).toHaveBeenCalledTimes(3)

    unmount()
  })

  it('NO refresca si zwap_session está vacía (no hay sesión)', async () => {
    sessionCookie.value = null
    const { unmount } = withSetup(() => useSessionRefresh())

    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 2)
    expect(refreshSessionMock).not.toHaveBeenCalled()

    unmount()
  })

  it('onUnmounted limpia el timer (no más ticks)', async () => {
    const { unmount } = withSetup(() => useSessionRefresh())
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)
    expect(refreshSessionMock).toHaveBeenCalledTimes(1)

    unmount()
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 3)
    expect(refreshSessionMock).toHaveBeenCalledTimes(1)
  })

  it('error en refresh NO crashea el timer (sigue disparando)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    refreshSessionMock.mockRejectedValueOnce(new Error('network down'))

    const { unmount } = withSetup(() => useSessionRefresh())
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)
    // Drenar microtasks para que el await de tick() termine y el catch corra.
    await vi.runAllTicks()
    expect(refreshSessionMock).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalled()

    // Próximo tick: refresh OK.
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)
    expect(refreshSessionMock).toHaveBeenCalledTimes(2)

    warn.mockRestore()
    unmount()
  })
})

describe('useSessionRefresh — visibilitychange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    refreshSessionMock.mockClear()
    sessionCookie.value = '1'
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true, writable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('hidden → stop timer (no más ticks)', async () => {
    const { unmount } = withSetup(() => useSessionRefresh())

    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true, writable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 2)
    expect(refreshSessionMock).not.toHaveBeenCalled()

    unmount()
  })

  it('visible → tick inmediato (PC despierta del sleep) + restart timer', async () => {
    const { unmount } = withSetup(() => useSessionRefresh())

    // Avanzar 5 min, luego ocultar (cancela el timer original).
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true, writable: true })
    document.dispatchEvent(new Event('visibilitychange'))

    // Avanzar 10 min mientras hidden — no debería disparar (timer parado).
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000)
    expect(refreshSessionMock).not.toHaveBeenCalled()

    // Volver visible: dispara tick inmediato + arranca nuevo timer.
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true, writable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.runAllTicks()
    expect(refreshSessionMock).toHaveBeenCalledTimes(1)

    // El próximo refresh programado es a los 13 min desde el visibilitychange.
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS)
    expect(refreshSessionMock).toHaveBeenCalledTimes(2)

    unmount()
  })

  it('visible sin sesión: NO dispara refresh aunque se ejecute tick inmediato', async () => {
    sessionCookie.value = null
    const { unmount } = withSetup(() => useSessionRefresh())

    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true, writable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.runAllTicks()
    expect(refreshSessionMock).not.toHaveBeenCalled()

    unmount()
  })
})
