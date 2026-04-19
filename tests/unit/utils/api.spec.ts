import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { setActivePinia, createPinia } from 'pinia'

// Stubs de auto-imports Nuxt — deben existir ANTES de importar api.js
const tokenRef = { value: 'test-token' as string | null }
vi.stubGlobal('useCookie', vi.fn(() => tokenRef))
vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({ public: { apiUrl: 'http://api.test' } })))
vi.stubGlobal('useNuxtApp', vi.fn(() => ({ $i18n: { t: (k: string) => k } })))
const navigateTo = vi.fn()
vi.stubGlobal('navigateTo', navigateTo)

// Import tras stubs
const { get, post, logout } = await import('~/utils/api.js')

// MSW server para interceptar fetch
const server = setupServer(
  http.get('http://api.test/ok', () => HttpResponse.json({ hello: 'world' })),
  http.get('http://api.test/protected', () => HttpResponse.json({ error: 'no auth' }, { status: 401 })),
  http.get('http://api.test/server-error', () => HttpResponse.json({ error: 'boom' }, { status: 500 })),
  http.get('http://api.test/no-content', () => new HttpResponse(null, { status: 204 })),
  http.post('http://api.test/auth/logout', () => HttpResponse.json({ ok: true })),
  http.post('http://api.test/echo', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ echoed: body })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

beforeEach(() => {
  setActivePinia(createPinia())
  tokenRef.value = 'test-token'
  navigateTo.mockClear()
})

describe('api.request — GET success', () => {
  it('200 OK: devuelve body JSON', async () => {
    const res = await get('/ok')
    expect(res).toEqual({ hello: 'world' })
  })

  it('204 No Content: devuelve null', async () => {
    const res = await get('/no-content')
    expect(res).toBeNull()
  })

  it('incluye Authorization header cuando hay token', async () => {
    let capturedHeaders: Headers | null = null
    server.use(
      http.get('http://api.test/echo-headers', ({ request }) => {
        capturedHeaders = request.headers
        return HttpResponse.json({ ok: true })
      }),
    )
    await get('/echo-headers')
    expect(capturedHeaders?.get('authorization')).toBe('Bearer test-token')
  })

  it('sin token: NO incluye Authorization', async () => {
    tokenRef.value = null
    let capturedHeaders: Headers | null = null
    server.use(
      http.get('http://api.test/echo-headers', ({ request }) => {
        capturedHeaders = request.headers
        return HttpResponse.json({ ok: true })
      }),
    )
    await get('/echo-headers')
    expect(capturedHeaders?.get('authorization')).toBeNull()
  })
})

describe('api.request — POST', () => {
  it('body se serializa como JSON', async () => {
    const res = await post('/echo', { name: 'Ana', age: 30 })
    expect(res).toEqual({ echoed: { name: 'Ana', age: 30 } })
  })
})

describe('api.request — 401 handling (R3 #12)', () => {
  it('401: limpia cookie + toast + redirige a /login + throw', async () => {
    tokenRef.value = 'expired-token'
    await expect(get('/protected')).rejects.toThrow('Unauthorized')
    expect(tokenRef.value).toBeNull()
    expect(navigateTo).toHaveBeenCalledWith('/login')
  })
})

describe('api.request — non-OK responses', () => {
  it('500: throw con status attached al error', async () => {
    try {
      await get('/server-error')
      expect.fail('should have thrown')
    } catch (err: unknown) {
      const e = err as Error & { status?: number }
      expect(e.status).toBe(500)
      expect(e.message).toContain('500')
    }
  })
})

describe('api.logout', () => {
  it('POST /auth/logout + limpia cookie', async () => {
    await logout()
    expect(tokenRef.value).toBeNull()
  })

  it('backend caído: cookie se limpia igual (best-effort)', async () => {
    server.use(
      http.post('http://api.test/auth/logout', () => HttpResponse.error()),
    )
    tokenRef.value = 'still-here'
    await logout()
    expect(tokenRef.value).toBeNull()
  })
})
