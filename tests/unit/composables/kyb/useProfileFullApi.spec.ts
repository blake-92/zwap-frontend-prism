import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { ofetch } from 'ofetch'

const cookieStore = new Map<string, { value: unknown }>()
vi.stubGlobal('useCookie', vi.fn((name: string) => {
  if (!cookieStore.has(name)) cookieStore.set(name, { value: null })
  return cookieStore.get(name)!
}))
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({ public: { apiBase: 'http://api.test' } })))
vi.stubGlobal('useNuxtApp', vi.fn(() => ({ $i18n: { t: (k: string) => k } })))
vi.stubGlobal('$fetch', ofetch)
vi.stubGlobal('navigateTo', vi.fn().mockResolvedValue(undefined))

vi.mock('~/stores/session', () => ({ useSessionStore: () => ({ clear: vi.fn() }) }))
vi.mock('~/stores/toast', () => ({ useToastStore: () => ({ addToast: vi.fn() }) }))

const { useProfileFullApi } = await import('~/composables/kyb/useProfileFullApi')
const { ApiError } = await import('~/utils/api')

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

beforeEach(() => {
  cookieStore.clear()
  try { localStorage.removeItem('zwap-last-refresh-at') } catch { /* jsdom edge */ }
})

describe('useProfileFullApi — getters', () => {
  it('GET /api/account/profile devuelve { person, legalEntities }', async () => {
    server.use(http.get('http://api.test/api/account/profile', () =>
      HttpResponse.json({
        person: { id: 'p-1', givenName: 'Ana', familyName: 'Lopez' },
        legalEntities: [
          { id: 'e-1', primary: true, entityType: 'SRL', legalName: 'Hotel SRL', jurisdiction: 'BO' },
        ],
      }),
    ))
    const api = useProfileFullApi()
    const result = await api.getProfile()
    expect(result.person.givenName).toBe('Ana')
    expect(result.legalEntities).toHaveLength(1)
    expect(result.legalEntities[0].primary).toBe(true)
  })

  it('GET /api/account/profile/business-profile 404: caller decide tratar como DRAFT vacío', async () => {
    server.use(http.get('http://api.test/api/account/profile/business-profile', () =>
      HttpResponse.json({ error: 'business_profile_not_found' }, { status: 404 }),
    ))
    const api = useProfileFullApi()
    await expect(api.getBusinessProfile()).rejects.toMatchObject({ status: 404 })
  })
})

describe('useProfileFullApi — mutations', () => {
  it('PATCH /person: KYC FULL', async () => {
    let body: unknown = null
    server.use(http.patch('http://api.test/api/account/profile/person', async ({ request }) => {
      body = await request.json()
      return HttpResponse.json({ person: { id: 'p-1' } })
    }))
    const api = useProfileFullApi()
    await api.patchPerson({
      maritalStatus: 'MARRIED',
      occupation: 'Hotelera',
      residentialAddress: { street: 'X', city: 'La Paz', country: 'BO' },
      sourceOfFunds: 'BUSINESS_INCOME',
      usPerson: false,
    } as never)
    expect(body).toMatchObject({ maritalStatus: 'MARRIED', usPerson: false })
  })

  it('patchEntity throw si falta entityId — fail fast', () => {
    const api = useProfileFullApi()
    expect(() => api.patchEntity('', {} as never)).toThrowError(/entityId requerido/)
  })

  it('PATCH /entity/{id}: ruta correcta', async () => {
    let url: string | null = null
    server.use(http.patch('http://api.test/api/account/profile/entity/e-42', ({ request }) => {
      url = request.url
      return HttpResponse.json({ id: 'e-42' })
    }))
    const api = useProfileFullApi()
    await api.patchEntity('e-42', { registeredAddress: { street: 'Y', city: 'La Paz', country: 'BO' } } as never)
    expect(url).toContain('/api/account/profile/entity/e-42')
  })

  it('PUT /business-profile: upsert', async () => {
    let body: unknown = null
    server.use(http.put('http://api.test/api/account/profile/business-profile', async ({ request }) => {
      body = await request.json()
      return HttpResponse.json({ merchantId: 'm-1', profileStatus: 'DRAFT' })
    }))
    const api = useProfileFullApi()
    const result = await api.putBusinessProfile({
      websiteUrl: 'https://x.bo',
      productsDescription: 'Hospedaje y tours',
      mccCode: '7011',
    } as never)
    expect(body).toMatchObject({ websiteUrl: 'https://x.bo', mccCode: '7011' })
    expect(result.profileStatus).toBe('DRAFT')
  })

  it('PUT /business-profile 409 cuando profileStatus == SUBMITTED: ApiError preserva detail', async () => {
    server.use(http.put('http://api.test/api/account/profile/business-profile', () =>
      HttpResponse.json({ error: 'business_profile_locked', detail: 'no editable en estado SUBMITTED' }, { status: 409 }),
    ))
    const api = useProfileFullApi()
    await expect(api.putBusinessProfile({} as never)).rejects.toMatchObject({
      status: 409,
      code: 'business_profile_locked',
      message: 'no editable en estado SUBMITTED',
    })
  })

  it('uploadPersonDocument: multipart correcto', async () => {
    let received: string | null = null
    server.use(http.post('http://api.test/api/account/profile/documents/person', async ({ request }) => {
      const fd = await request.formData()
      received = fd.get('documentType') as string
      return HttpResponse.json({ documentId: 'd-1', documentType: 'PROOF_OF_ADDRESS', uploadedAt: '2026-05-04T00:00:00Z' })
    }))
    const api = useProfileFullApi()
    const fd = new FormData()
    fd.append('file', new Blob(['x']), 'p.pdf')
    fd.append('documentType', 'PROOF_OF_ADDRESS')
    const result = await api.uploadPersonDocument(fd)
    expect(received).toBe('PROOF_OF_ADDRESS')
    expect(result.documentId).toBe('d-1')
  })

  it('uploadEntityDocument throw si falta entityId', () => {
    const api = useProfileFullApi()
    expect(() => api.uploadEntityDocument('', new FormData())).toThrowError(/entityId requerido/)
  })

  it('submitForFull: POST /submit-for-full', async () => {
    let called = false
    server.use(http.post('http://api.test/api/account/profile/submit-for-full', () => {
      called = true
      return HttpResponse.json({ profileStatus: 'SUBMITTED' })
    }))
    const api = useProfileFullApi()
    await api.submitForFull()
    expect(called).toBe(true)
  })

  it('submitForFull 409 falta residentialAddress: error legible', async () => {
    server.use(http.post('http://api.test/api/account/profile/submit-for-full', () =>
      HttpResponse.json({ error: 'kyb_invalid_data', detail: 'falta residentialAddress en Person' }, { status: 409 }),
    ))
    const api = useProfileFullApi()
    await expect(api.submitForFull()).rejects.toMatchObject({
      status: 409,
      code: 'kyb_invalid_data',
      message: /residentialAddress/,
    })
  })
})

describe('useProfileFullApi.pollBusinessProfile', () => {
  it('emite onChange en transición DRAFT → IN_REVIEW → APPROVED, stop al APPROVED', async () => {
    vi.useFakeTimers()
    let calls = 0
    server.use(http.get('http://api.test/api/account/profile/business-profile', () => {
      calls++
      const profileStatus = calls === 1 ? 'SUBMITTED' : calls === 2 ? 'IN_REVIEW' : 'APPROVED'
      return HttpResponse.json({ merchantId: 'm-1', profileStatus, createdAt: '', updatedAt: '' })
    }))

    const api = useProfileFullApi()
    const states: string[] = []
    const poller = api.pollBusinessProfile({
      onChange: (bp) => states.push(bp.profileStatus),
      initialState: 'SUBMITTED',
    })
    poller.start()
    await vi.runOnlyPendingTimersAsync()       // tick 1: SUBMITTED == initialState, no emite
    await vi.advanceTimersByTimeAsync(15_000)
    await vi.runOnlyPendingTimersAsync()       // tick 2: IN_REVIEW
    await vi.advanceTimersByTimeAsync(15_000)
    await vi.runOnlyPendingTimersAsync()       // tick 3: APPROVED → stop

    expect(states).toEqual(['IN_REVIEW', 'APPROVED'])
    poller.stop()
    vi.useRealTimers()
  })

  it('404 silencioso (BP todavía no creado): NO llama onError, sigue polling', async () => {
    vi.useFakeTimers()
    let calls = 0
    server.use(http.get('http://api.test/api/account/profile/business-profile', () => {
      calls++
      if (calls === 1) return HttpResponse.json({ error: 'business_profile_not_found' }, { status: 404 })
      return HttpResponse.json({ merchantId: 'm-1', profileStatus: 'APPROVED', createdAt: '', updatedAt: '' })
    }))

    const api = useProfileFullApi()
    const errors: unknown[] = []
    const states: string[] = []
    const poller = api.pollBusinessProfile({
      onChange: (bp) => states.push(bp.profileStatus),
      onError: (e) => errors.push(e),
    })
    poller.start()
    await vi.runOnlyPendingTimersAsync()        // tick 1: 404 silent
    await vi.advanceTimersByTimeAsync(15_000)
    await vi.runOnlyPendingTimersAsync()        // tick 2: APPROVED → stop

    expect(errors).toEqual([])
    expect(states).toEqual(['APPROVED'])
    poller.stop()
    vi.useRealTimers()
  })

  it('5xx: emite onError pero NO stop (espera retry)', async () => {
    vi.useFakeTimers()
    let calls = 0
    server.use(http.get('http://api.test/api/account/profile/business-profile', () => {
      calls++
      if (calls <= 2) return HttpResponse.json({ error: 'boom' }, { status: 503 })
      return HttpResponse.json({ merchantId: 'm-1', profileStatus: 'APPROVED', createdAt: '', updatedAt: '' })
    }))

    const api = useProfileFullApi()
    const errors: unknown[] = []
    const states: string[] = []
    const poller = api.pollBusinessProfile({
      onChange: (bp) => states.push(bp.profileStatus),
      onError: (e) => errors.push(e),
    })
    poller.start()
    await vi.runOnlyPendingTimersAsync()
    await vi.advanceTimersByTimeAsync(15_000)
    await vi.runOnlyPendingTimersAsync()
    await vi.advanceTimersByTimeAsync(15_000)
    await vi.runOnlyPendingTimersAsync()

    expect(errors.length).toBeGreaterThanOrEqual(1)
    expect(errors[0]).toBeInstanceOf(ApiError)
    expect(states).toEqual(['APPROVED'])
    poller.stop()
    vi.useRealTimers()
  })
})
