import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll, vi } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { ofetch } from 'ofetch'

// ── Stubs Nuxt auto-imports — antes de importar api.js / composables ───────────────────────────
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

const { useKybApi } = await import('~/composables/kyb/useKybApi')
const { useKybDraft, __resetKybDraftForTests } = await import('~/composables/kyb/useKybDraft')
const { ApiError } = await import('~/utils/api')

const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

beforeEach(() => {
  __resetKybDraftForTests()
  try { localStorage.clear() } catch { /* ignore */ }
  cookieStore.clear()
})

// ── start() ───────────────────────────────────────────────────────────────────────────────────
describe('useKybApi.start', () => {
  it('POST /api/kyb/start: persiste applicationId+token via useKybDraft', async () => {
    server.use(http.post('http://api.test/api/kyb/start', () =>
      HttpResponse.json({ applicationId: 'app-1', applicationToken: 'tok-1', state: 'DRAFT' }),
    ))

    const api = useKybApi()
    const result = await api.start({ ownerEmail: 'test@hotel.bo' })

    expect(result.applicationId).toBe('app-1')
    expect(useKybDraft().applicationId.value).toBe('app-1')
    expect(useKybDraft().applicationToken.value).toBe('tok-1')
  })

  it('start() acepta body vacío (ownerEmail opcional)', async () => {
    server.use(http.post('http://api.test/api/kyb/start', () =>
      HttpResponse.json({ applicationId: 'app-2', applicationToken: 'tok-2', state: 'DRAFT' }),
    ))
    const api = useKybApi()
    await expect(api.start()).resolves.toMatchObject({ applicationId: 'app-2' })
  })

  it('start() incluye personHeritable cuando backend lo manda (caller autenticado)', async () => {
    server.use(http.post('http://api.test/api/kyb/start', () =>
      HttpResponse.json({
        applicationId: 'app-3',
        applicationToken: 'tok-3',
        state: 'DRAFT',
        personHeritable: true,
        personPreview: { id: 'p-1', givenName: 'Ana', familyName: 'Lopez', kycVerifiedAt: '2026-01-01T00:00:00Z' },
      }),
    ))
    const api = useKybApi()
    const r = await api.start({ ownerEmail: 'ana@hotel.bo' })
    expect(r.personHeritable).toBe(true)
    expect(r.personPreview?.givenName).toBe('Ana')
  })

  it('start() backend rate-limited 429: ApiError, NO persiste draft', async () => {
    server.use(http.post('http://api.test/api/kyb/start', () =>
      HttpResponse.json({ error: 'rate_limit' }, { status: 429 }),
    ))
    const api = useKybApi()
    await expect(api.start()).rejects.toBeInstanceOf(ApiError)
    expect(useKybDraft().hasDraft.value).toBe(false)
  })
})

// ── path-dependent endpoints (steps + uploads + submit) ────────────────────────────────────────
describe('useKybApi — endpoints con applicationId', () => {
  function withDraft() {
    useKybDraft().start({ applicationId: 'app-x', applicationToken: 'tok-x' })
    return useKybApi()
  }

  it('throw legible si no hay draft activo (programmer error)', () => {
    const api = useKybApi()
    expect(() => api.patchStep1Person({} as never)).toThrowError(/no hay draft activo/)
  })

  it('patchStep1Person: PATCH /api/kyb/{id}/step-1-person con header X-KYB-Application-Token', async () => {
    let receivedToken: string | null = null
    let receivedBody: unknown = null
    server.use(http.patch('http://api.test/api/kyb/app-x/step-1-person', async ({ request }) => {
      receivedToken = request.headers.get('X-KYB-Application-Token')
      receivedBody = await request.json()
      return HttpResponse.json({ applicationId: 'app-x', state: 'DRAFT' })
    }))

    const api = withDraft()
    await api.patchStep1Person({
      givenName: 'Ana',
      familyName: 'Lopez',
      dateOfBirth: '1990-05-12',
      nationality: 'BO',
      isPep: false,
      isPepRelated: false,
    })
    expect(receivedToken).toBe('tok-x')
    expect(receivedBody).toMatchObject({ givenName: 'Ana', isPep: false })
  })

  it('patchStep2Entity, patchStep3Roles, patchStep4AdditionalEntity, patchStep5Merchant: rutean al path correcto', async () => {
    const calls: string[] = []
    const handlers = ['step-2-entity', 'step-3-role', 'step-4-additional-entity', 'step-5-merchant'].map((suffix) =>
      http.patch(`http://api.test/api/kyb/app-x/${suffix}`, () => {
        calls.push(suffix)
        return HttpResponse.json({ ok: true })
      }),
    )
    server.use(...handlers)

    const api = withDraft()
    await api.patchStep2Entity({ entityType: 'SRL', legalName: 'X', jurisdiction: 'BO' } as never)
    await api.patchStep3Roles({ roles: [{ role: 'LEGAL_REPRESENTATIVE' }] } as never)
    await api.patchStep4AdditionalEntity({ entityType: 'LLC', legalName: 'Y', jurisdiction: 'US', currency: 'USD' } as never)
    await api.patchStep5Merchant({ displayName: 'Z', branches: [{ address: { street: 'a', city: 'b', country: 'BO' } }] } as never)

    expect(calls).toEqual(['step-2-entity', 'step-3-role', 'step-4-additional-entity', 'step-5-merchant'])
  })

  it('uploadPersonDocument: POST multipart con FormData; backend recibe file + documentType', async () => {
    let receivedType: string | null = null
    let contentType: string | null = null
    server.use(http.post('http://api.test/api/kyb/app-x/documents/person', async ({ request }) => {
      contentType = request.headers.get('content-type')
      const fd = await request.formData()
      receivedType = fd.get('documentType') as string
      return HttpResponse.json({ documentId: 'd-1', documentType: 'CI_BO', uploadedAt: '2026-05-04T00:00:00Z' })
    }))

    const api = withDraft()
    const fd = new FormData()
    fd.append('file', new Blob(['data'], { type: 'image/png' }), 'ci.png')
    fd.append('documentType', 'CI_BO')
    fd.append('documentCountry', 'BO')

    const result = await api.uploadPersonDocument(fd)
    expect(result.documentId).toBe('d-1')
    expect(receivedType).toBe('CI_BO')
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/)
  })

  it('uploadPersonDocument 413 kyb_file_too_large → ApiError preserva code + detail', async () => {
    server.use(http.post('http://api.test/api/kyb/app-x/documents/person', () =>
      HttpResponse.json({ error: 'kyb_file_too_large', detail: 'archivo supera 10 MB' }, { status: 413 }),
    ))

    const api = withDraft()
    const fd = new FormData()
    fd.append('file', new Blob(['x'.repeat(11 * 1024 * 1024)]), 'big.pdf')
    fd.append('documentType', 'CI_BO')

    try {
      await api.uploadPersonDocument(fd)
      expect.fail('should throw')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as InstanceType<typeof ApiError>).status).toBe(413)
      expect((err as InstanceType<typeof ApiError>).code).toBe('kyb_file_too_large')
      expect((err as InstanceType<typeof ApiError>).message).toBe('archivo supera 10 MB')
    }
  })

  it('submit: POST /api/kyb/{id}/submit', async () => {
    let called = false
    server.use(http.post('http://api.test/api/kyb/app-x/submit', () => {
      called = true
      return HttpResponse.json({ applicationId: 'app-x', state: 'SUBMITTED' })
    }))
    const api = withDraft()
    const result = await api.submit()
    expect(called).toBe(true)
    expect(result.state).toBe('SUBMITTED')
  })

  it('submit 409 kyb_invalid_data: error.code + detail accesibles', async () => {
    server.use(http.post('http://api.test/api/kyb/app-x/submit', () =>
      HttpResponse.json({ error: 'kyb_invalid_data', detail: 'falta documento INCORPORATION_DEED' }, { status: 409 }),
    ))
    const api = withDraft()
    await expect(api.submit()).rejects.toMatchObject({
      status: 409,
      code: 'kyb_invalid_data',
      message: 'falta documento INCORPORATION_DEED',
    })
  })

  it('GET /api/kyb/{id} 404: ApiError 404 (caller debe tratarlo como draft expirado)', async () => {
    server.use(http.get('http://api.test/api/kyb/app-x', () =>
      HttpResponse.json({ error: 'kyb_application_not_found', detail: 'token inválido' }, { status: 404 }),
    ))
    const api = withDraft()
    await expect(api.getApplication()).rejects.toMatchObject({
      status: 404,
      code: 'kyb_application_not_found',
    })
  })
})

// ── searchEconomicActivities ──────────────────────────────────────────────────────────────────
describe('useKybApi.searchEconomicActivities', () => {
  it('GET /economic-activities con jurisdiction + q en query string', async () => {
    let url: string | null = null
    server.use(http.get('http://api.test/api/kyb/economic-activities', ({ request }) => {
      url = request.url
      return HttpResponse.json([
        { code: '551001', description: 'Servicios de hospedaje' },
      ])
    }))
    const api = useKybApi()
    const result = await api.searchEconomicActivities({ jurisdiction: 'BO', q: 'hotel' })
    expect(url).toContain('jurisdiction=BO')
    expect(url).toContain('q=hotel')
    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('551001')
  })
})

// ── pollStatus ────────────────────────────────────────────────────────────────────────────────
describe('useKybApi.pollStatus', () => {
  it('emite onChange cuando state cambia y stop al llegar a APPROVED', async () => {
    vi.useFakeTimers()
    let calls = 0
    server.use(http.get('http://api.test/api/kyb/app-poll', () => {
      calls++
      const state = calls === 1 ? 'SUBMITTED' : calls === 2 ? 'IN_REVIEW' : 'APPROVED'
      return HttpResponse.json({ applicationId: 'app-poll', state })
    }))

    useKybDraft().start({ applicationId: 'app-poll', applicationToken: 'tok-p' })
    const api = useKybApi()

    const changes: string[] = []
    const poller = api.pollStatus({
      onChange: (app) => changes.push(app.state ?? '?'),
      initialState: 'SUBMITTED',
    })
    poller.start()
    // Tick 1 (inmediato): SUBMITTED, no emite (== initialState).
    await vi.runOnlyPendingTimersAsync()
    // Tick 2: IN_REVIEW, emite.
    await vi.advanceTimersByTimeAsync(15_000)
    await vi.runOnlyPendingTimersAsync()
    // Tick 3: APPROVED, emite + stop.
    await vi.advanceTimersByTimeAsync(15_000)
    await vi.runOnlyPendingTimersAsync()

    expect(changes).toEqual(['IN_REVIEW', 'APPROVED'])
    poller.stop()
    vi.useRealTimers()
  })

  it('404 → llama onExpired y stop', async () => {
    vi.useFakeTimers()
    server.use(http.get('http://api.test/api/kyb/app-gone', () =>
      HttpResponse.json({ error: 'kyb_application_not_found' }, { status: 404 }),
    ))

    useKybDraft().start({ applicationId: 'app-gone', applicationToken: 'tok-g' })
    const api = useKybApi()

    let expiredCalled = false
    const poller = api.pollStatus({
      onChange: () => {},
      onExpired: () => { expiredCalled = true },
    })
    poller.start()
    await vi.runOnlyPendingTimersAsync()
    expect(expiredCalled).toBe(true)
    vi.useRealTimers()
  })
})
