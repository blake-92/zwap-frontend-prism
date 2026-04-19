import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useDebouncedSearch } from '~/composables/useDebouncedSearch'
import { usePerformanceStore } from '~/stores/performance'
import { withSetup } from '../helpers/withSetup'

describe('useDebouncedSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('Prism/Normal (no Lite): update instantáneo, no debounce', async () => {
    const src = ref('')
    const { result, unmount } = withSetup(() => {
      const store = usePerformanceStore()
      store.tier = 'full' // Prism
      return useDebouncedSearch(() => src.value)
    })
    expect(result.value).toBe('')
    src.value = 'hola'
    await vi.advanceTimersByTimeAsync(0)
    expect(result.value).toBe('hola')
    unmount()
  })

  it('Lite: update debounced (250ms)', async () => {
    const src = ref('')
    const { result, unmount } = withSetup(() => {
      const store = usePerformanceStore()
      store.tier = 'lite'
      return useDebouncedSearch(() => src.value)
    })
    src.value = 'hola'
    await vi.advanceTimersByTimeAsync(0)
    // Antes del delay, debe seguir igual
    expect(result.value).toBe('')
    await vi.advanceTimersByTimeAsync(100)
    expect(result.value).toBe('')
    await vi.advanceTimersByTimeAsync(200) // total 300 ms > 250
    expect(result.value).toBe('hola')
    unmount()
  })

  it('Lite: keystrokes rápidos colapsan a un único update final', async () => {
    const src = ref('')
    const { result, unmount } = withSetup(() => {
      const store = usePerformanceStore()
      store.tier = 'lite'
      return useDebouncedSearch(() => src.value, { liteDelay: 100 })
    })
    src.value = 'h'
    await vi.advanceTimersByTimeAsync(50)
    src.value = 'ho'
    await vi.advanceTimersByTimeAsync(50)
    src.value = 'hol'
    await vi.advanceTimersByTimeAsync(50)
    src.value = 'hola'
    // Aún no ha pasado el delay completo desde el último cambio
    expect(result.value).toBe('')
    await vi.advanceTimersByTimeAsync(150)
    expect(result.value).toBe('hola')
    unmount()
  })

  it('onInput dispara inmediatamente (aun con debounce)', async () => {
    const onInput = vi.fn()
    const src = ref('')
    const { unmount } = withSetup(() => {
      const store = usePerformanceStore()
      store.tier = 'lite'
      return useDebouncedSearch(() => src.value, { onInput })
    })
    src.value = 'x'
    await vi.advanceTimersByTimeAsync(0)
    expect(onInput).toHaveBeenCalledWith('x')
    unmount()
  })

  it('cleanup cancela timer pendiente en onUnmounted', async () => {
    const src = ref('')
    const { result, unmount } = withSetup(() => {
      const store = usePerformanceStore()
      store.tier = 'lite'
      return useDebouncedSearch(() => src.value)
    })
    src.value = 'pending'
    await vi.advanceTimersByTimeAsync(50)
    unmount()
    // Avance suficiente para que el timer hubiera disparado — pero fue cancelado
    await vi.advanceTimersByTimeAsync(500)
    expect(result.value).toBe('')
  })
})
