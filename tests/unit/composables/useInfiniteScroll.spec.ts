import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'
import { withSetup } from '../helpers/withSetup'

interface FakeIO {
  observe: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  _callback: (entries: Array<{ isIntersecting: boolean }>) => void
  _opts: IntersectionObserverInit | undefined
  _trigger: () => void
}

let ios: FakeIO[] = []

beforeEach(() => {
  ios = []
  // @ts-expect-error test stub
  window.IntersectionObserver = class {
    constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void, opts?: IntersectionObserverInit) {
      const io: FakeIO = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
        _callback: callback,
        _opts: opts,
        _trigger: () => callback([{ isIntersecting: true }]),
      }
      ios.push(io)
      return io as unknown as IntersectionObserver
    }
  }
})

describe('useInfiniteScroll', () => {
  it('muestra batchSize inicial', () => {
    const data = ref(Array.from({ length: 50 }, (_, i) => i))
    const { result, unmount } = withSetup(() => useInfiniteScroll(data, { batchSize: 10 }))
    expect(result.visibleData.value.length).toBe(10)
    expect(result.hasMore.value).toBe(true)
    unmount()
  })

  it('sentinel intersection agrega más items', async () => {
    const data = ref(Array.from({ length: 50 }, (_, i) => i))
    const { result, unmount } = withSetup(() => useInfiniteScroll(data, { batchSize: 10 }))
    // Inicialmente sentinelRef es null, observer no se crea todavía.
    // Asignamos un elemento y forzamos re-setup
    result.sentinelRef.value = document.createElement('div')
    await nextTick()
    // Ahora debería haber un observer. Trigger intersection.
    expect(ios.length).toBeGreaterThan(0)
    ios[ios.length - 1]._trigger()
    await nextTick()
    expect(result.visibleData.value.length).toBe(20)
    ios[ios.length - 1]._trigger()
    await nextTick()
    expect(result.visibleData.value.length).toBe(30)
    unmount()
  })

  it('hasMore=false cuando visibleCount >= data.length', async () => {
    const data = ref([1, 2, 3])
    const { result, unmount } = withSetup(() => useInfiniteScroll(data, { batchSize: 10 }))
    // batchSize (10) > data.length (3) → visible = 3, hasMore = false
    expect(result.visibleData.value.length).toBe(3)
    expect(result.hasMore.value).toBe(false)
    unmount()
  })

  it('enabled=false devuelve data completa sin slice, hasMore=false', () => {
    const data = ref(Array.from({ length: 50 }, (_, i) => i))
    const { result, unmount } = withSetup(() => useInfiniteScroll(data, { batchSize: 10, enabled: false }))
    expect(result.visibleData.value.length).toBe(50)
    expect(result.hasMore.value).toBe(false)
    unmount()
  })

  it('reset cuando el dataset se reduce (filtro aplicado)', async () => {
    const data = ref(Array.from({ length: 50 }, (_, i) => i))
    const { result, unmount } = withSetup(() => useInfiniteScroll(data, { batchSize: 10 }))
    result.sentinelRef.value = document.createElement('div')
    await nextTick()
    ios[ios.length - 1]._trigger()
    await nextTick()
    expect(result.visibleData.value.length).toBe(20)
    // Aplica filtro: dataset reduce
    data.value = Array.from({ length: 5 }, (_, i) => i)
    await nextTick()
    expect(result.visibleData.value.length).toBe(5) // batchSize=10 pero data solo 5
    unmount()
  })

  it('observer desconectado en onUnmounted', async () => {
    const data = ref([1, 2, 3])
    const { result, unmount } = withSetup(() => useInfiniteScroll(data, { batchSize: 1 }))
    result.sentinelRef.value = document.createElement('div')
    await nextTick()
    const lastIO = ios[ios.length - 1]
    unmount()
    expect(lastIO.disconnect).toHaveBeenCalled()
  })
})
