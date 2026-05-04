// HTTP client wrapper for backend integration (fase 1.5 puente).
//
// Cookie strategy (backend emits 3 cookies on /auth/login y /auth/refresh):
//   - zwap_token   (httpOnly, /, 15min)   → JWT access. NO leerlo desde JS.
//   - zwap_session (NOT httpOnly, /, 15min) → flag '1' que JS usa para detectar "logueado".
//   - zwap_refresh (httpOnly, /api/auth, 30d) → opaque refresh token; viaja solo a /api/auth/*.
//
// Requests SIEMPRE deben usar `credentials: 'include'`. NO mandar Authorization Bearer.
// El backend lee la cookie zwap_token automáticamente.
//
// Refresh flow: si una request protegida devuelve 401, llamamos POST /api/auth/refresh
// (single-flight: 1 sola promesa concurrente para evitar storms con N tabs / N requests
// disparando refresh en paralelo). Si refresh OK → re-intentar la request original.
// Si refresh falla → limpiar sesión + redirigir a /login.

import { ROUTES, isSafeInternalPath } from '~/utils/routes'
import { useToastStore } from '~/stores/toast'

const DEFAULT_TIMEOUT = 15000
const REFRESH_TIMEOUT = 10000             // H2: refresh tiene su propio timeout corto.
const REFRESH_DEDUP_WINDOW_MS = 60 * 1000 // H1: si otra tab refrescó hace <60s, no re-refrescamos.
const REFRESH_LAST_KEY = 'zwap-last-refresh-at'
const REFRESH_LOCK_NAME = 'zwap-session-refresh'

// Endpoints que NUNCA deben re-intentarse vía refresh (evita loops).
const AUTH_BYPASS = new Set([
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/logout',
])

// Single-flight intra-tab: cuando un refresh está in-flight en ESTA pestaña, todas las requests
// con 401 esperan el mismo resultado. NO cubre refreshes en otras tabs — ese caso lo cubre
// navigator.locks abajo (lock global por origen del browser).
let refreshPromise = null

// Single-flight del logout: si N requests reciben fatal-401 simultáneo, solo una corre el cleanup.
let logoutPromise = null

export class ApiError extends Error {
  constructor({ status, code, message, requestId, data }) {
    super(message || `API error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
    this.data = data
  }
}

function apiBase() {
  return useRuntimeConfig().public.apiBase
}

function withTimeout(userSignal, ms) {
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(new DOMException('Request timeout', 'TimeoutError')), ms)
  if (userSignal) {
    if (userSignal.aborted) controller.abort(userSignal.reason)
    else userSignal.addEventListener('abort', () => controller.abort(userSignal.reason), { once: true })
  }
  return { signal: controller.signal, cancel: () => clearTimeout(tid) }
}

async function rawRequest(method, path, body, { timeout, signal: userSignal } = {}) {
  const { signal, cancel } = withTimeout(userSignal, timeout ?? DEFAULT_TIMEOUT)
  try {
    return await $fetch(`${apiBase()}${path}`, {
      method,
      body,
      credentials: 'include',
      signal,
    })
  } finally {
    cancel()
  }
}

function readLastRefreshAt() {
  if (typeof localStorage === 'undefined') return null
  try {
    const v = localStorage.getItem(REFRESH_LAST_KEY)
    return v ? Number.parseInt(v, 10) : null
  } catch { return null }
}

function writeLastRefreshAt(ts) {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(REFRESH_LAST_KEY, String(ts)) } catch { /* quota / safari private */ }
}

// Adquirir lock cross-tab vía Web Locks API. Solo una pestaña del browser puede correr
// el callback a la vez para una key dada. Si la API no existe (Safari < 15.4 o entornos
// raros), degradamos a ejecución directa — el `refreshPromise` intra-tab + `lastRefreshAt`
// limita el daño al peor caso "1 refresh por tab por dedup-window".
async function withCrossTabLock(name, fn) {
  if (typeof navigator === 'undefined' || !navigator.locks?.request) return fn()
  return navigator.locks.request(name, fn)
}

async function doRefreshFetch() {
  // H2: timeout dedicado al refresh. Si el backend cuelga, no bloqueamos el refreshPromise.
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(new DOMException('Refresh timeout', 'TimeoutError')), REFRESH_TIMEOUT)
  try {
    await $fetch(`${apiBase()}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
    })
    return 'ok'
  } catch (err) {
    const status = err?.response?.status ?? err?.status
    return status === 401 ? 'fatal' : 'network-error'
  } finally {
    clearTimeout(tid)
  }
}

// Exportada para que el timer proactivo (`useSessionRefresh`) y el middleware de auth
// compartan el MISMO single-flight que el interceptor reactivo de 401.
//
// 3 layers de coordinación (de adentro hacia afuera):
//   1. `refreshPromise` (module-level, intra-tab): N callers en la misma tab → 1 refresh.
//   2. `navigator.locks.request` (cross-tab, mismo origin): N tabs concurrentes → 1 refresh.
//      Sin esto, 2 tabs disparando refresh casi-simultáneo → el segundo POST usa un
//      zwap_refresh ya rotado → backend dispara reuse-detection → revoca toda la cadena
//      → ambas tabs deslogueadas.
//   3. `REFRESH_LAST_KEY` en localStorage (cross-tab, ventana temporal): si otra tab
//      refrescó en los últimos 60s, esta tab toma el lock pero NO refresca — devuelve 'ok'
//      asumiendo que las cookies del browser ya están frescas (las rotó la otra tab).
//      Esto evita que tab B haga un refresh redundante 100ms después de tab A.
//
// Retorna 3 outcomes que el doc del backend (`frontend-session-refresh.md`) trata distinto:
//   - 'ok'             → refresh OK (o skip por dedup window). Cookies frescas.
//   - 'fatal'          → 401 explícito. Sesión muerta. Limpiar estado + redirect a login.
//   - 'network-error'  → timeout, 5xx, CORS, offline. NO limpiar sesión.
export async function refreshSession() {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    return await withCrossTabLock(REFRESH_LOCK_NAME, async () => {
      // Bajo el lock cross-tab, re-chequeamos lastRefreshAt: otra tab pudo haber refrescado
      // mientras esperábamos el lock. Si fue muy reciente, evitamos el redundant refresh
      // (que el backend va a aceptar pero rota cookies innecesariamente y gasta rate-limit).
      const lastAt = readLastRefreshAt()
      if (lastAt && (Date.now() - lastAt) < REFRESH_DEDUP_WINDOW_MS) {
        return 'ok'
      }
      const result = await doRefreshFetch()
      if (result === 'ok') writeLastRefreshAt(Date.now())
      return result
    })
  })().finally(() => {
    // Liberar en el próximo tick para que callers concurrentes que entren mid-flight tomen el mismo resultado.
    queueMicrotask(() => { refreshPromise = null })
  })
  return refreshPromise
}

// M1: single-flight. Si N requests reciben fatal-401 simultáneo, solo una corre el cleanup
// (cookie clear + store clear + toast + navigateTo). Sin esto: N toasts apilados, N navigateTo
// compitiendo, N veces limpiando estado.
async function handleAuthFailure() {
  if (logoutPromise) return logoutPromise
  logoutPromise = (async () => {
    // 1) limpiar flag de sesión visible para JS (el backend ya la expira via Set-Cookie,
    //    pero limpiarla acá hace que la UI reaccione inmediatamente sin esperar el round-trip).
    try {
      const session = useCookie('zwap_session', { sameSite: 'lax', path: '/' })
      session.value = null
    } catch { /* SSR/edge: ignorar */ }

    // 2) limpiar sessionStore. Import dinámico para evitar ciclo (sessionStore importa este wrapper).
    try {
      const { useSessionStore } = await import('~/stores/session')
      useSessionStore().clear()
    } catch { /* store no inicializado: ignorar */ }

    // 3) toast informativo (i18n via nuxtApp porque vivimos fuera de setup).
    try {
      const { $i18n } = useNuxtApp()
      useToastStore().addToast($i18n.t('errors.sessionExpired'), 'error')
    } catch { /* i18n no inicializado: ignorar */ }

    // 4) redirect preservando el path actual para post-login.
    let redirect
    if (typeof window !== 'undefined') {
      const candidate = window.location.pathname + window.location.search
      if (candidate && candidate !== '/' && candidate !== ROUTES.LOGIN && isSafeInternalPath(candidate)) {
        redirect = candidate
      }
    }
    try {
      await navigateTo({ path: ROUTES.LOGIN, query: redirect ? { redirect } : undefined })
    } catch { /* SSR/edge o Nuxt no montado: ignorar */ }
  })().finally(() => {
    // Liberar en el próximo tick: si llegan más callers después del cleanup, queremos que
    // entren a una nueva ronda (improbable pero posible si el user vuelve a loguearse rápido).
    queueMicrotask(() => { logoutPromise = null })
  })
  return logoutPromise
}

function toApiError(err) {
  const status = err?.response?.status ?? err?.status ?? 0
  const data = err?.data ?? err?.response?._data ?? null
  const requestId = err?.response?.headers?.get?.('X-Request-Id') ?? null
  return new ApiError({
    status,
    code: data?.error,
    message: data?.message ?? err?.message,
    requestId,
    data,
  })
}

async function request(method, path, body, opts = {}) {
  try {
    return await rawRequest(method, path, body, opts)
  } catch (err) {
    const status = err?.response?.status ?? err?.status

    if (status === 401 && !AUTH_BYPASS.has(path)) {
      const result = await refreshSession()
      if (result === 'ok') {
        try {
          return await rawRequest(method, path, body, opts)
        } catch (err2) {
          const status2 = err2?.response?.status ?? err2?.status
          if (status2 === 401) {
            await handleAuthFailure()
          }
          throw toApiError(err2)
        }
      }
      // Solo el 401 explícito significa "sesión muerta". Network errors NO limpian sesión:
      // el usuario puede estar offline o el backend caído — kickearlo a login sería peor UX.
      if (result === 'fatal') {
        await handleAuthFailure()
      }
      throw toApiError(err)
    }

    throw toApiError(err)
  }
}

export const get = (path, opts) => request('GET', path, undefined, opts)
export const post = (path, body, opts) => request('POST', path, body, opts)
export const patch = (path, body, opts) => request('PATCH', path, body, opts)
export const put = (path, body, opts) => request('PUT', path, body, opts)
export const del = (path, opts) => request('DELETE', path, undefined, opts)
