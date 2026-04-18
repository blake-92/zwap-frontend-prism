// HTTP client wrapper. Currently unused (mockData in place);
// swap-in when backend is ready without touching views.

const DEFAULT_TIMEOUT = 15000

const tokenCookieOpts = () => ({
  sameSite: 'lax',
  secure: !import.meta.dev,
  path: '/',
})

function authHeaders() {
  const token = useCookie('zwap_token', tokenCookieOpts()).value
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Compone un AbortSignal del usuario con un timeout propio.
function withTimeout(userSignal, ms) {
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(new DOMException('Request timeout', 'TimeoutError')), ms)

  if (userSignal) {
    if (userSignal.aborted) controller.abort(userSignal.reason)
    else userSignal.addEventListener('abort', () => controller.abort(userSignal.reason), { once: true })
  }

  return { signal: controller.signal, cancel: () => clearTimeout(tid) }
}

async function request(method, path, body, { timeout = DEFAULT_TIMEOUT, signal: userSignal } = {}) {
  const { public: { apiUrl } } = useRuntimeConfig()
  const { signal, cancel } = withTimeout(userSignal, timeout)

  try {
    const res = await fetch(`${apiUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })

    if (res.status === 401) {
      const token = useCookie('zwap_token', tokenCookieOpts())
      token.value = null
      await navigateTo('/login')
      throw new Error('Unauthorized')
    }

    if (!res.ok) {
      const err = new Error(`API ${method} ${path} → ${res.status}`)
      err.status = res.status
      throw err
    }

    // Algunas rutas devuelven 204 No Content.
    if (res.status === 204) return null
    return res.json()
  } finally {
    cancel()
  }
}

export const get = (path, opts) => request('GET', path, undefined, opts)
export const post = (path, body, opts) => request('POST', path, body, opts)
export const put = (path, body, opts) => request('PUT', path, body, opts)
export const del = (path, opts) => request('DELETE', path, undefined, opts)
