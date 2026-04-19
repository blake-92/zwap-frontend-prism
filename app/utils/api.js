// HTTP client wrapper. Currently unused (mockData in place);
// swap-in when backend is ready without touching views.

import { useToastStore } from '~/stores/toast'

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
      // Toast no bloqueante: notifica expiración antes del redirect silencioso.
      // `$i18n.t` se invoca via nuxtApp porque el wrapper vive fuera de setup.
      try {
        const { $i18n } = useNuxtApp()
        useToastStore().addToast($i18n.t('errors.sessionExpired'), 'error')
      } catch { /* toast/i18n no inicializado aún */ }
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

/**
 * Logout: invalida sesión en backend (si existe) y limpia cookie local.
 * Resiliente: un error de red NO debe dejar al usuario autenticado en UI.
 */
export async function logout() {
  try { await post('/auth/logout', null, { timeout: 3000 }) } catch { /* best-effort */ }
  useCookie('zwap_token', tokenCookieOpts()).value = null
}
