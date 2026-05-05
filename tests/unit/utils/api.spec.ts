import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { ofetch } from 'ofetch'

// ── Stubs de auto-imports Nuxt — antes de importar api.js ──────────────────────────────────────
//
// Cookie store: el wrapper usa useCookie('zwap_session') para limpiar el flag tras 401 fatal.
const cookieStore = new Map<string, { value: unknown }>()
const useCookieMock = vi.fn((name: string) => {
  if (!cookieStore.has(name)) cookieStore.set(name, { value: null })
  return cookieStore.get(name)!
})
vi.stubGlobal('useCookie', useCookieMock)

vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({ public: { apiBase: 'http://api.test' } })))
vi.stubGlobal('useNuxtApp', vi.fn(() => ({ $i18n: { t: (k: string) => k } })))

// $fetch (auto-import Nuxt) → ofetch real, así MSW intercepta las requests via fetch nativo.
vi.stubGlobal('$fetch', ofetch)

const navigateTo = vi.fn().mockResolvedValue(undefined)
vi.stubGlobal('navigateTo', navigateTo)

// handleAuthFailure dynamic-importa el sessionStore + lee toast — mockeamos para no requerir Pinia.
vi.mock('~/stores/session', () => ({
  useSessionStore: () => ({ clear: vi.fn() }),
}))
vi.mock('~/stores/toast', () => ({
  useToastStore: () => ({ addToast: vi.fn() }),
}))

// Import tras stubs.
const { get, post, postMultipart, ApiError } = await import('~/utils/api.js')

// ── MSW setup ──────────────────────────────────────────────────────────────────────────────────
const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

beforeEach(() => {
  cookieStore.clear()
  navigateTo.mockClear()
  // H1: lastRefreshAt vive en localStorage. Limpiar entre tests para que el dedup window
  // no contamine specs distintos.
  try { localStorage.removeItem('zwap-last-refresh-at') } catch { /* jsdom edge */ }
})

// ── Happy path ─────────────────────────────────────────────────────────────────────────────────
describe('api wrapper — happy path', () => {
  it('GET 200 → devuelve body JSON parseado', async () => {
    server.use(http.get('http://api.test/api/ping', () => HttpResponse.json({ ok: true })))
    expect(await get('/api/ping')).toEqual({ ok: true })
  })

  it('POST → serializa body JSON', async () => {
    server.use(http.post('http://api.test/api/echo', async ({ request }) =>
      HttpResponse.json({ echoed: await request.json() }),
    ))
    const res = await post('/api/echo', { hello: 'world' })
    expect(res).toEqual({ echoed: { hello: 'world' } })
  })

  it('204 No Content → resuelve sin throw (body null/undefined)', async () => {
    server.use(http.post('http://api.test/api/auth/logout', () => new HttpResponse(null, { status: 204 })))
    await expect(post('/api/auth/logout')).resolves.not.toThrow()
  })
})

// ── Error mapping ──────────────────────────────────────────────────────────────────────────────
describe('api wrapper — error mapping (ApiError shape)', () => {
  it('500 → ApiError con status', async () => {
    server.use(http.get('http://api.test/api/boom', () =>
      HttpResponse.json({ error: 'oops' }, { status: 500 }),
    ))
    await expect(get('/api/boom')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'oops',
    })
  })

  it('409 conflict → ApiError preserva code + message del backend', async () => {
    server.use(http.post('http://api.test/api/users', () =>
      HttpResponse.json({ error: 'conflict', message: 'email_already_in_use' }, { status: 409 }),
    ))
    try {
      await post('/api/users', {})
      expect.fail('should throw')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      const e = err as ApiError
      expect(e.status).toBe(409)
      expect(e.code).toBe('conflict')
      expect(e.message).toBe('email_already_in_use')
    }
  })
})

// ── Refresh interceptor ────────────────────────────────────────────────────────────────────────
describe('api wrapper — auth bypass (no refresh on /api/auth/*)', () => {
  it('401 en /api/auth/login NO dispara refresh ni redirect', async () => {
    let refreshCalled = 0
    server.use(
      http.post('http://api.test/api/auth/login', () =>
        HttpResponse.json({ error: 'invalid_credentials' }, { status: 401 }),
      ),
      http.post('http://api.test/api/auth/refresh', () => {
        refreshCalled++
        return HttpResponse.json({})
      }),
    )
    await expect(post('/api/auth/login', {})).rejects.toMatchObject({
      status: 401,
      code: 'invalid_credentials',
    })
    expect(refreshCalled).toBe(0)
    expect(navigateTo).not.toHaveBeenCalled()
  })
})

describe('api wrapper — refresh interceptor', () => {
  it('401 + refresh OK → reintenta y devuelve OK del retry', async () => {
    let attempts = 0
    server.use(
      http.get('http://api.test/api/me', () => {
        attempts++
        return attempts === 1
          ? HttpResponse.json({ error: 'unauthorized' }, { status: 401 })
          : HttpResponse.json({ user: 'ana' })
      }),
      http.post('http://api.test/api/auth/refresh', () => HttpResponse.json({})),
    )
    expect(await get('/api/me')).toEqual({ user: 'ana' })
    expect(attempts).toBe(2)
  })

  it('401 + refresh FAIL → ApiError(401) + clear zwap_session + navigateTo /login', async () => {
    server.use(
      http.get('http://api.test/api/me', () => HttpResponse.json({ error: 'unauthorized' }, { status: 401 })),
      http.post('http://api.test/api/auth/refresh', () => HttpResponse.json({}, { status: 401 })),
    )
    cookieStore.set('zwap_session', { value: '1' })
    await expect(get('/api/me')).rejects.toMatchObject({ status: 401 })
    expect(cookieStore.get('zwap_session')?.value).toBeNull()
    expect(navigateTo).toHaveBeenCalled()
    expect(navigateTo.mock.calls[0][0]).toMatchObject({ path: '/login' })
  })

  it('401 + refresh network-error (5xx) → NO limpia sesión, NO redirect', async () => {
    server.use(
      http.get('http://api.test/api/me', () => HttpResponse.json({ error: 'unauthorized' }, { status: 401 })),
      http.post('http://api.test/api/auth/refresh', () => HttpResponse.json({ error: 'boom' }, { status: 503 })),
    )
    cookieStore.set('zwap_session', { value: '1' })
    await expect(get('/api/me')).rejects.toMatchObject({ status: 401 })
    // Cookie sigue presente — el refresh falló por red, no por sesión muerta.
    expect(cookieStore.get('zwap_session')?.value).toBe('1')
    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('refresh single-flight: 2 requests 401 concurrentes → 1 solo POST /refresh', async () => {
    let refreshCount = 0
    let meAttempt = 0
    server.use(
      http.get('http://api.test/api/me', () => {
        meAttempt++
        return meAttempt <= 2
          ? HttpResponse.json({ error: 'unauthorized' }, { status: 401 })
          : HttpResponse.json({ ok: true })
      }),
      http.post('http://api.test/api/auth/refresh', async () => {
        refreshCount++
        await new Promise((r) => setTimeout(r, 15))
        return HttpResponse.json({})
      }),
    )
    await Promise.all([get('/api/me'), get('/api/me')])
    expect(refreshCount).toBe(1)
  })
})

// ── H1: dedup window cross-tab vía localStorage ────────────────────────────────────────────────
describe('api wrapper — refresh dedup window (H1)', () => {
  it('refresh exitoso escribe lastRefreshAt en localStorage', async () => {
    const { refreshSession } = await import('~/utils/api.js')
    server.use(http.post('http://api.test/api/auth/refresh', () => HttpResponse.json({})))
    expect(localStorage.getItem('zwap-last-refresh-at')).toBeNull()
    expect(await refreshSession()).toBe('ok')
    const ts = Number.parseInt(localStorage.getItem('zwap-last-refresh-at') ?? '0', 10)
    expect(ts).toBeGreaterThan(Date.now() - 5000)
  })

  it('si lastRefreshAt < 60s atrás → skip fetch, devuelve "ok" sin llamar /refresh', async () => {
    const { refreshSession } = await import('~/utils/api.js')
    let calls = 0
    server.use(http.post('http://api.test/api/auth/refresh', () => {
      calls++
      return HttpResponse.json({})
    }))
    // Simulamos que otra tab refrescó hace 5s.
    localStorage.setItem('zwap-last-refresh-at', String(Date.now() - 5000))
    expect(await refreshSession()).toBe('ok')
    expect(calls).toBe(0)
  })

  it('si lastRefreshAt > 60s atrás → SÍ refresca', async () => {
    const { refreshSession } = await import('~/utils/api.js')
    let calls = 0
    server.use(http.post('http://api.test/api/auth/refresh', () => {
      calls++
      return HttpResponse.json({})
    }))
    localStorage.setItem('zwap-last-refresh-at', String(Date.now() - 90 * 1000))
    expect(await refreshSession()).toBe('ok')
    expect(calls).toBe(1)
  })

  it('refresh fatal NO escribe lastRefreshAt (no engaña a otras tabs)', async () => {
    const { refreshSession } = await import('~/utils/api.js')
    server.use(http.post('http://api.test/api/auth/refresh', () =>
      HttpResponse.json({ error: 'invalid_credentials' }, { status: 401 })))
    expect(await refreshSession()).toBe('fatal')
    expect(localStorage.getItem('zwap-last-refresh-at')).toBeNull()
  })
})

// ── H2: timeout dedicado al refresh ────────────────────────────────────────────────────────────
describe('api wrapper — refresh timeout (H2)', () => {
  it('si /api/auth/refresh nunca responde → resuelve "network-error" (no cuelga refreshPromise)', async () => {
    const { refreshSession } = await import('~/utils/api.js')
    // MSW handler que nunca resuelve. Confiamos en que el AbortController dispare a los 10s.
    // Para no bloquear el test 10s, usamos vi.useFakeTimers + advanceTimersByTime.
    vi.useFakeTimers()
    let resolved: string | undefined
    server.use(http.post('http://api.test/api/auth/refresh', () => new Promise(() => {})))
    const promise = refreshSession().then((r) => { resolved = r })
    // Avanzar virtualmente 10s + 100ms para disparar el setTimeout del timeout.
    await vi.advanceTimersByTimeAsync(10_100)
    await promise
    vi.useRealTimers()
    expect(resolved).toBe('network-error')
  })
})

// ── F1.1: postMultipart + headers + noAuth + error.detail ─────────────────────────────────────
describe('api wrapper — F1.1 KYB foundation extensions', () => {
  it('error con shape backend KYB ({error, detail}) → ApiError.message lee detail', async () => {
    server.use(http.get('http://api.test/api/kyb/abc', () =>
      HttpResponse.json({ error: 'kyb_application_not_found', detail: 'applicationId o token inválido' }, { status: 404 }),
    ))
    try {
      await get('/api/kyb/abc')
      expect.fail('should throw')
    } catch (err) {
      const e = err as InstanceType<typeof ApiError>
      expect(e.status).toBe(404)
      expect(e.code).toBe('kyb_application_not_found')
      expect(e.message).toBe('applicationId o token inválido')
    }
  })

  it('opts.headers se propagan al backend (X-KYB-Application-Token)', async () => {
    let receivedToken: string | null = null
    server.use(http.get('http://api.test/api/kyb/xyz', ({ request }) => {
      receivedToken = request.headers.get('X-KYB-Application-Token')
      return HttpResponse.json({ applicationId: 'xyz', state: 'DRAFT' })
    }))
    await get('/api/kyb/xyz', { headers: { 'X-KYB-Application-Token': 'tok-123' } })
    expect(receivedToken).toBe('tok-123')
  })

  it('opts.noAuth: 401 NO dispara refresh ni navigateTo (capability-token endpoints)', async () => {
    let refreshCount = 0
    server.use(
      http.get('http://api.test/api/kyb/secret', () =>
        HttpResponse.json({ error: 'kyb_application_not_found', detail: 'token inválido' }, { status: 401 }),
      ),
      http.post('http://api.test/api/auth/refresh', () => {
        refreshCount++
        return HttpResponse.json({})
      }),
    )
    await expect(get('/api/kyb/secret', { noAuth: true })).rejects.toMatchObject({ status: 401 })
    expect(refreshCount).toBe(0)
    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('postMultipart: FormData se manda sin JSON serialize, browser pone Content-Type multipart', async () => {
    let contentType: string | null = null
    let bodyKind: string | null = null
    server.use(http.post('http://api.test/api/kyb/abc/documents/person', async ({ request }) => {
      contentType = request.headers.get('content-type')
      // request.formData() resuelve solo si ofetch realmente mandó FormData (no string JSON).
      try {
        const fd = await request.formData()
        bodyKind = fd.get('documentType') as string
      } catch {
        bodyKind = 'NOT_FORMDATA'
      }
      return HttpResponse.json({ documentId: 'doc-1', documentType: 'CI_BO', uploadedAt: '2026-05-04T00:00:00Z' })
    }))
    const fd = new FormData()
    fd.append('file', new Blob(['x'], { type: 'image/png' }), 'ci.png')
    fd.append('documentType', 'CI_BO')
    const result = await postMultipart('/api/kyb/abc/documents/person', fd, {
      headers: { 'X-KYB-Application-Token': 'tok-456' },
      noAuth: true,
    })
    expect(result).toMatchObject({ documentId: 'doc-1' })
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/)
    expect(bodyKind).toBe('CI_BO')
  })
})

// ── M1: handleAuthFailure single-flight ────────────────────────────────────────────────────────
describe('api wrapper — handleAuthFailure single-flight (M1)', () => {
  it('N requests con fatal-401 simultáneo → 1 solo navigateTo (no N toasts/redirects)', async () => {
    cookieStore.set('zwap_session', { value: '1' })
    server.use(
      http.get('http://api.test/api/a', () => HttpResponse.json({}, { status: 401 })),
      http.get('http://api.test/api/b', () => HttpResponse.json({}, { status: 401 })),
      http.get('http://api.test/api/c', () => HttpResponse.json({}, { status: 401 })),
      http.post('http://api.test/api/auth/refresh', () => HttpResponse.json({}, { status: 401 })),
    )
    // 3 requests concurrentes que todas terminan en fatal-401 → handleAuthFailure se llama
    // 3 veces conceptualmente, pero el single-flight debe colapsarlas en 1 navigateTo.
    await Promise.allSettled([get('/api/a'), get('/api/b'), get('/api/c')])
    expect(navigateTo).toHaveBeenCalledTimes(1)
    expect(navigateTo.mock.calls[0][0]).toMatchObject({ path: '/login' })
  })
})
