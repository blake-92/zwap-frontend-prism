import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock api wrapper. El store importa `del` (entre otros). Solo necesitamos controlar `del`
// para los specs de archive.
const delMock = vi.fn()
vi.mock('~/utils/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: (...args: unknown[]) => delMock(...args),
}))

// useCookie auto-import (lo usa setActive/readCookie). Devolvemos un objeto inerte.
vi.stubGlobal('useCookie', vi.fn(() => ({ value: null })))

const { useBranchesStore } = await import('~/stores/branches')

describe('branches store — archive optimistic con rollback (M4)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    delMock.mockReset()
  })

  it('archive éxito: marca local ARCHIVED y backend confirma', async () => {
    const store = useBranchesStore()
    store.items = [
      { id: 'b1', name: 'Principal', status: 'ACTIVE', isPrimary: true },
      { id: 'b2', name: 'Secundaria', status: 'ACTIVE', isPrimary: false },
    ]
    delMock.mockResolvedValueOnce(undefined)

    await store.archive('b2')

    expect(delMock).toHaveBeenCalledWith('/api/branches/b2')
    expect(store.items.find((b) => b.id === 'b2')?.status).toBe('ARCHIVED')
    expect(store.items.find((b) => b.id === 'b1')?.status).toBe('ACTIVE')
  })

  it('archive falla: rollback restaura el state previo + propaga error', async () => {
    const store = useBranchesStore()
    const original = { id: 'b2', name: 'Secundaria', status: 'ACTIVE', isPrimary: false }
    store.items = [
      { id: 'b1', name: 'Principal', status: 'ACTIVE', isPrimary: true },
      original,
    ]
    delMock.mockRejectedValueOnce(new Error('409 conflict — última branch'))

    await expect(store.archive('b2')).rejects.toThrow('409 conflict')

    // State debe haber vuelto al estado pre-archive: ACTIVE, no ARCHIVED.
    expect(store.items.find((b) => b.id === 'b2')?.status).toBe('ACTIVE')
  })

  it('archive de id inexistente: noop (no crash)', async () => {
    const store = useBranchesStore()
    store.items = [{ id: 'b1', name: 'Principal', status: 'ACTIVE', isPrimary: true }]

    await store.archive('does-not-exist')
    expect(delMock).not.toHaveBeenCalled()
    expect(store.items[0].id).toBe('b1')
  })
})
