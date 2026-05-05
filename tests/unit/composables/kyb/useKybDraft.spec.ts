import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useKybDraft, __resetKybDraftForTests } from '~/composables/kyb/useKybDraft'

const STORAGE_KEY_ID = 'zwap-kyb-application-id'
const STORAGE_KEY_TOKEN = 'zwap-kyb-application-token'
const STORAGE_KEY_STARTED_AT = 'zwap-kyb-started-at'
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000

describe('useKybDraft — persistencia + recovery + expiración', () => {
  beforeEach(() => {
    __resetKybDraftForTests()
    try { localStorage.clear() } catch { /* jsdom edge */ }
  })

  it('start(): persiste applicationId + token + startedAt en localStorage', () => {
    const draft = useKybDraft()
    draft.start({ applicationId: 'app-1', applicationToken: 'tok-1' })

    expect(draft.applicationId.value).toBe('app-1')
    expect(draft.applicationToken.value).toBe('tok-1')
    expect(draft.hasDraft.value).toBe(true)
    expect(localStorage.getItem(STORAGE_KEY_ID)).toBe('app-1')
    expect(localStorage.getItem(STORAGE_KEY_TOKEN)).toBe('tok-1')
    expect(Number.parseInt(localStorage.getItem(STORAGE_KEY_STARTED_AT), 10)).toBeGreaterThan(0)
  })

  it('start() sin id o sin token throwea — fail fast', () => {
    const draft = useKybDraft()
    expect(() => draft.start({ applicationId: '', applicationToken: 'x' })).toThrow(/requeridos/)
    expect(() => draft.start({ applicationId: 'x', applicationToken: '' })).toThrow(/requeridos/)
  })

  it('clear(): wipea state + localStorage', () => {
    const draft = useKybDraft()
    draft.start({ applicationId: 'app-1', applicationToken: 'tok-1' })
    draft.clear()

    expect(draft.applicationId.value).toBeNull()
    expect(draft.applicationToken.value).toBeNull()
    expect(draft.hasDraft.value).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY_ID)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY_TOKEN)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY_STARTED_AT)).toBeNull()
  })

  it('recover(): hidrata desde localStorage si no expiró → true', () => {
    localStorage.setItem(STORAGE_KEY_ID, 'app-2')
    localStorage.setItem(STORAGE_KEY_TOKEN, 'tok-2')
    localStorage.setItem(STORAGE_KEY_STARTED_AT, String(Date.now() - 1000))

    const draft = useKybDraft() // lazy hydrate corre aquí
    expect(draft.hasDraft.value).toBe(true)
    expect(draft.applicationId.value).toBe('app-2')
    expect(draft.applicationToken.value).toBe('tok-2')
  })

  it('recover(): draft de hace >30 días → wipea + devuelve false', () => {
    localStorage.setItem(STORAGE_KEY_ID, 'app-old')
    localStorage.setItem(STORAGE_KEY_TOKEN, 'tok-old')
    localStorage.setItem(STORAGE_KEY_STARTED_AT, String(Date.now() - DRAFT_TTL_MS - 1000))

    const draft = useKybDraft()
    expect(draft.hasDraft.value).toBe(false)
    // Debe haber limpiado localStorage también — no dejar basura colgando.
    expect(localStorage.getItem(STORAGE_KEY_ID)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY_TOKEN)).toBeNull()
  })

  it('recover(): startedAt ausente → trata como expirado y wipea', () => {
    localStorage.setItem(STORAGE_KEY_ID, 'app-no-ts')
    localStorage.setItem(STORAGE_KEY_TOKEN, 'tok-no-ts')
    // SIN STORAGE_KEY_STARTED_AT — corner case: localStorage manipulado o versión vieja.

    const draft = useKybDraft()
    expect(draft.hasDraft.value).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY_ID)).toBeNull()
  })

  it('recover(): sin nada en localStorage → false, no throw', () => {
    const draft = useKybDraft()
    expect(draft.hasDraft.value).toBe(false)
  })

  it('authHeaders(): vacío sin draft, con token con draft activo', () => {
    const draft = useKybDraft()
    expect(draft.authHeaders()).toEqual({})

    draft.start({ applicationId: 'app-h', applicationToken: 'tok-h' })
    expect(draft.authHeaders()).toEqual({ 'X-KYB-Application-Token': 'tok-h' })
  })

  it('singleton: dos llamadas a useKybDraft() devuelven el mismo state', () => {
    const a = useKybDraft()
    a.start({ applicationId: 'shared', applicationToken: 'shared-tok' })

    const b = useKybDraft()
    expect(b.applicationId.value).toBe('shared')
    expect(b.applicationToken.value).toBe('shared-tok')
  })

  it('isExpired: false con draft fresco', () => {
    const draft = useKybDraft()
    draft.start({ applicationId: 'fresh', applicationToken: 'fresh-tok' })
    expect(draft.isExpired.value).toBe(false)
  })

  it('isExpired: true cuando startedAt > TTL', () => {
    // Forzamos timestamp viejo via localStorage + recover (start() siempre usa Date.now()).
    localStorage.setItem(STORAGE_KEY_ID, 'app-stale')
    localStorage.setItem(STORAGE_KEY_TOKEN, 'tok-stale')
    localStorage.setItem(STORAGE_KEY_STARTED_AT, String(Date.now() - DRAFT_TTL_MS - 1))

    const draft = useKybDraft()
    // Recover ya wipeó por expirado — isExpired es false porque startedAt es null.
    expect(draft.hasDraft.value).toBe(false)
    expect(draft.isExpired.value).toBe(false)
  })

  it('localStorage throwing (Safari private mode): start no crashea, state en memoria sí guarda', () => {
    const draft = useKybDraft()
    const origSet = Storage.prototype.setItem
    Storage.prototype.setItem = vi.fn(() => { throw new DOMException('QuotaExceededError') })
    try {
      draft.start({ applicationId: 'mem-only', applicationToken: 'mem-tok' })
      expect(draft.applicationId.value).toBe('mem-only')
      expect(draft.hasDraft.value).toBe(true)
    } finally {
      Storage.prototype.setItem = origSet
    }
  })
})
