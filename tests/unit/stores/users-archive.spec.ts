import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const delMock = vi.fn()
vi.mock('~/utils/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: (...args: unknown[]) => delMock(...args),
}))

const { useUsersStore } = await import('~/stores/users')

describe('users store — archive optimistic con rollback (M4)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    delMock.mockReset()
  })

  it('archive éxito: marca local ARCHIVED', async () => {
    const store = useUsersStore()
    store.items = [
      { id: 'u1', email: 'a@x.com', status: 'ACTIVE', roles: [] },
      { id: 'u2', email: 'b@x.com', status: 'ACTIVE', roles: [] },
    ]
    delMock.mockResolvedValueOnce(undefined)

    await store.archive('u1')

    expect(delMock).toHaveBeenCalledWith('/api/users/u1')
    expect(store.items.find((u) => u.id === 'u1')?.status).toBe('ARCHIVED')
  })

  it('archive falla (409 último OWNER): rollback restaura ACTIVE', async () => {
    const store = useUsersStore()
    store.items = [{ id: 'u1', email: 'owner@x.com', status: 'ACTIVE', roles: [{ roleCode: 'OWNER' }] }]
    delMock.mockRejectedValueOnce(new Error('409 last_owner'))

    await expect(store.archive('u1')).rejects.toThrow('409 last_owner')
    expect(store.items[0].status).toBe('ACTIVE')
  })
})
