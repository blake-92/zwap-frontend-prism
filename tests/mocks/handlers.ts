import { http, HttpResponse } from 'msw'
import { buildTransaction, buildUser, buildLink, buildPayout } from '../factories'

// Base URL: cuando conecten la API real, esto cambia a la real y los handlers de abajo se borran.
// Mientras tanto, `mockData.js` ya provee los datasets — estos handlers son para tests E2E
// que necesitan CONTROL del response (ej: simular 500, timeout, datos específicos).

const API = '*/api'

export const handlers = [
  // GET /api/transactions — lista paginada
  http.get(`${API}/transactions`, ({ request }) => {
    const url = new URL(request.url)
    const count = Number(url.searchParams.get('count') ?? 25)
    return HttpResponse.json({
      data: Array.from({ length: count }, () => buildTransaction()),
      total: count,
    })
  }),

  // GET /api/users
  http.get(`${API}/users`, () => {
    return HttpResponse.json({
      data: Array.from({ length: 10 }, () => buildUser()),
    })
  }),

  // GET /api/links
  http.get(`${API}/links`, () => {
    return HttpResponse.json({
      data: Array.from({ length: 15 }, () => buildLink()),
    })
  }),

  // GET /api/payouts
  http.get(`${API}/payouts`, () => {
    return HttpResponse.json({
      data: Array.from({ length: 20 }, () => buildPayout()),
    })
  }),

  // POST /api/auth/login — success por default
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string }
    if (body?.email === 'fail@example.com') {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    return HttpResponse.json({ token: 'mock-jwt-token', user: buildUser({ email: body?.email }) })
  }),

  // POST /api/auth/logout
  http.post(`${API}/auth/logout`, () => {
    return HttpResponse.json({ ok: true })
  }),
]

// Handlers específicos para testear error states (importar selectivamente en un spec).
export const errorHandlers = {
  transactions500: http.get(`${API}/transactions`, () =>
    HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 }),
  ),
  transactions401: http.get(`${API}/transactions`, () =>
    HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  ),
  transactionsTimeout: http.get(`${API}/transactions`, async () => {
    await new Promise(r => setTimeout(r, 10_000))
    return HttpResponse.json({ data: [] })
  }),
  transactionsNetworkError: http.get(`${API}/transactions`, () => HttpResponse.error()),
}
