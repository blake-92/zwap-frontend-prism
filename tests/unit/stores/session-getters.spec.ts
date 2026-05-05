import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// El store importa `get` y `post` solo para login/fetchMe/logout — no se ejecutan en estos specs
// (testeamos getters puros sobre estado seteado a mano), pero el módulo necesita resolver el
// import. Mockeamos vacíos.
vi.mock('~/utils/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
}))

// useCookie auto-import (usado por isAuthenticated/clear). Inerte para los tests de getters.
vi.stubGlobal('useCookie', vi.fn(() => ({ value: null })))

const { useSessionStore } = await import('~/stores/session')

describe('session store — activationLevel + kybState getters (fase 2)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('activationLevel default "NONE" cuando merchant es null (scope=zwap_admin)', () => {
    const store = useSessionStore()
    expect(store.merchant).toBeNull()
    expect(store.activationLevel).toBe('NONE')
  })

  it('activationLevel default "NONE" cuando merchant existe pero falta el campo (defensivo)', () => {
    const store = useSessionStore()
    store.merchant = { id: 'm1', businessName: 'Hotel de Sal' }
    expect(store.activationLevel).toBe('NONE')
  })

  it('activationLevel lee directo de merchant.activationLevel cuando viene', () => {
    const store = useSessionStore()
    store.merchant = { id: 'm1', businessName: 'Hotel de Sal', activationLevel: 'BASIC', kybState: 'GRANDFATHERED' }
    expect(store.activationLevel).toBe('BASIC')

    store.merchant = { ...store.merchant, activationLevel: 'FULL' }
    expect(store.activationLevel).toBe('FULL')
  })

  it('kybState default "DRAFT" cuando merchant es null', () => {
    const store = useSessionStore()
    expect(store.kybState).toBe('DRAFT')
  })

  it('kybState default "DRAFT" cuando merchant existe pero falta el campo', () => {
    const store = useSessionStore()
    store.merchant = { id: 'm1', businessName: 'Hotel de Sal' }
    expect(store.kybState).toBe('DRAFT')
  })

  it('kybState lee directo de merchant.kybState — cubre los 7 valores del backend', () => {
    const store = useSessionStore()
    const states = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED', 'GRANDFATHERED'] as const
    for (const s of states) {
      store.merchant = { id: 'm1', businessName: 'Hotel de Sal', activationLevel: 'BASIC', kybState: s }
      expect(store.kybState).toBe(s)
    }
  })

  it('clear() resetea merchant a null → getters vuelven a defaults', () => {
    const store = useSessionStore()
    store.merchant = { id: 'm1', businessName: 'Hotel de Sal', activationLevel: 'FULL', kybState: 'APPROVED' }
    expect(store.activationLevel).toBe('FULL')
    expect(store.kybState).toBe('APPROVED')

    store.clear()
    expect(store.activationLevel).toBe('NONE')
    expect(store.kybState).toBe('DRAFT')
  })
})
