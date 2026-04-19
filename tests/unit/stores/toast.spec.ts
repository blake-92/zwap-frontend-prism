import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToastStore } from '~/stores/toast'

describe('toast store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('estado inicial: toasts array vacío', () => {
    const store = useToastStore()
    expect(store.toasts).toEqual([])
  })

  it('addToast agrega con id único + defaults (success, 3000ms)', () => {
    const store = useToastStore()
    store.addToast('Hola')
    expect(store.toasts.length).toBe(1)
    expect(store.toasts[0]).toMatchObject({ message: 'Hola', type: 'success' })
    expect(store.toasts[0].id).toBeTruthy()
  })

  it('addToast con type custom y duration', () => {
    const store = useToastStore()
    store.addToast('Error!', 'error', 5000)
    expect(store.toasts[0].type).toBe('error')
  })

  it('auto-dismiss por default después de 3000ms', () => {
    const store = useToastStore()
    store.addToast('test')
    expect(store.toasts.length).toBe(1)
    vi.advanceTimersByTime(2999)
    expect(store.toasts.length).toBe(1)
    vi.advanceTimersByTime(2)
    expect(store.toasts.length).toBe(0)
  })

  it('duration=0 no dispara auto-dismiss (toast persistente)', () => {
    const store = useToastStore()
    store.addToast('sticky', 'info', 0)
    vi.advanceTimersByTime(10_000)
    expect(store.toasts.length).toBe(1)
  })

  it('removeToast limpia timer + remueve del array', () => {
    const store = useToastStore()
    store.addToast('test', 'success', 5000)
    const id = store.toasts[0].id
    store.removeToast(id)
    expect(store.toasts.length).toBe(0)
    // Timer cancelado: avanzar no agrega reflows
    vi.advanceTimersByTime(10_000)
    expect(store.toasts.length).toBe(0)
  })

  it('removeToast con id inexistente es no-op', () => {
    const store = useToastStore()
    store.addToast('a')
    expect(() => store.removeToast('no-existe')).not.toThrow()
    expect(store.toasts.length).toBe(1)
  })

  it('múltiples toasts simultáneos: cada uno se auto-dismissea independiente', () => {
    const store = useToastStore()
    store.addToast('a', 'success', 1000)
    store.addToast('b', 'error', 2000)
    expect(store.toasts.length).toBe(2)
    vi.advanceTimersByTime(1000)
    expect(store.toasts.length).toBe(1)
    expect(store.toasts[0].message).toBe('b')
    vi.advanceTimersByTime(1000)
    expect(store.toasts.length).toBe(0)
  })
})
