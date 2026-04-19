import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useViewSearchStore } from '~/stores/viewSearch'

describe('viewSearch store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('estado inicial: todo vacío/0', () => {
    const s = useViewSearchStore()
    expect(s.query).toBe('')
    expect(s.placeholder).toBe('')
    expect(s.hasFilters).toBe(false)
    expect(s.activeFilterCount).toBe(0)
  })

  it('setQuery actualiza query', () => {
    const s = useViewSearchStore()
    s.setQuery('hola')
    expect(s.query).toBe('hola')
  })

  it('setActiveFilterCount actualiza badge', () => {
    const s = useViewSearchStore()
    s.setActiveFilterCount(3)
    expect(s.activeFilterCount).toBe(3)
  })

  it('registerView setea placeholder + limpia query previa', () => {
    const s = useViewSearchStore()
    s.setQuery('previo')
    s.registerView('Buscar transacciones')
    expect(s.placeholder).toBe('Buscar transacciones')
    expect(s.query).toBe('')
  })

  it('registerView(null|undefined) deja placeholder vacío', () => {
    const s = useViewSearchStore()
    s.registerView(undefined)
    expect(s.placeholder).toBe('')
  })

  it('unregisterView resetea toda la config de vista', () => {
    const s = useViewSearchStore()
    s.registerView('algo')
    s.setQuery('query')
    s.setFilterOpener(() => {})
    s.setActiveFilterCount(2)
    s.unregisterView()
    expect(s.placeholder).toBe('')
    expect(s.query).toBe('')
    expect(s.hasFilters).toBe(false)
    expect(s.activeFilterCount).toBe(0)
  })

  it('setFilterOpener(fn) activa hasFilters + registra opener', () => {
    const s = useViewSearchStore()
    const opener = vi.fn()
    s.setFilterOpener(opener)
    expect(s.hasFilters).toBe(true)
    s.openFilters()
    expect(opener).toHaveBeenCalledOnce()
  })

  it('setFilterOpener(null) desactiva hasFilters', () => {
    const s = useViewSearchStore()
    s.setFilterOpener(() => {})
    expect(s.hasFilters).toBe(true)
    s.setFilterOpener(null)
    expect(s.hasFilters).toBe(false)
  })

  it('openFilters sin opener registrado: no-op silencioso', () => {
    const s = useViewSearchStore()
    expect(() => s.openFilters()).not.toThrow()
  })
})
