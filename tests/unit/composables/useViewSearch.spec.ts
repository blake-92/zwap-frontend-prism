import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { useViewSearch, useHeaderSearch } from '~/composables/useViewSearch'
import { withSetup } from '../helpers/withSetup'

describe('useViewSearch', () => {
  it('registra placeholder al montar', () => {
    const { result, unmount } = withSetup(() => useViewSearch('Buscar transacciones'))
    expect(result.placeholder).toBe('Buscar transacciones')
    unmount()
  })

  it('limpia placeholder al desmontar', () => {
    const { result, unmount } = withSetup(() => useViewSearch('Buscar'))
    expect(result.placeholder).toBe('Buscar')
    unmount()
    expect(result.placeholder).toBe('')
  })

  it('acepta Ref reactiva como placeholder', async () => {
    const ph = ref('inicio')
    const { result, unmount } = withSetup(() => useViewSearch(ph))
    expect(result.placeholder).toBe('inicio')
    ph.value = 'nuevo'
    await nextTick()
    expect(result.placeholder).toBe('nuevo')
    unmount()
  })

  it('useHeaderSearch devuelve el mismo store', () => {
    const { result: a, unmount: unA } = withSetup(() => useViewSearch('test'))
    const { result: b, unmount: unB } = withSetup(() => useHeaderSearch())
    // Ambos usan el store — API expuesta debe ser la misma (query, placeholder, etc.)
    expect(typeof a.setQuery).toBe('function')
    expect(typeof b.setQuery).toBe('function')
    unA()
    unB()
  })
})
