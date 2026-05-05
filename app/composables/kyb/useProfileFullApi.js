import { get, patch, put, post, postMultipart, ApiError } from '~/utils/api'
import './types'

/**
 * Composable para los endpoints del Profile FULL (post-aprobación BASIC).
 *
 * A diferencia del wizard anónimo, estos endpoints van con JWT cookie (`zwap_token`) — el
 * wrapper de api.js los maneja con su refresh interceptor, sin `noAuth`. Permisos:
 *
 *   - GET / PATCH `/api/account/profile/person` → cualquier user autenticado (datos propios).
 *   - PATCH `/api/account/profile/entity/{id}` → requiere `SETTINGS_MERCHANT`.
 *   - GET `/api/account/profile/business-profile` → cualquier user.
 *   - PUT `/api/account/profile/business-profile` → requiere `SETTINGS_MERCHANT`.
 *   - POST `/api/account/profile/submit-for-full` → requiere `SETTINGS_MERCHANT`.
 *
 * El permission check se hace en backend; la UI debe gating para no mostrar botones inertes
 * (ver fase 3 del plan: hide/disable según `useSessionStore.hasPermission('SETTINGS_MERCHANT')`).
 *
 * Estados editables del business_profile (PUT):
 *   - DRAFT, MORE_INFO_REQUIRED, REJECTED → editable, vuelve a DRAFT al guardar.
 *   - SUBMITTED, IN_REVIEW, APPROVED → 409 si se intenta editar.
 *
 * @returns API del profile FULL.
 */
export function useProfileFullApi() {
  /**
   * GET /api/account/profile — vista combinada person + legalEntities + docs.
   * @returns {Promise<import('./types').ProfileResponse>}
   */
  function getProfile() { return get('/api/account/profile') }

  /**
   * PATCH /api/account/profile/person — KYC FULL (datos del owner mismo).
   * @param {import('./types').ProfilePersonFullRequest} body
   */
  function patchPerson(body) { return patch('/api/account/profile/person', body) }

  /**
   * PATCH /api/account/profile/entity/{id} — KYB FULL del legal entity. Requiere SETTINGS_MERCHANT.
   * @param {string} entityId uuid del LegalEntity (sale en GET /profile)
   * @param {import('./types').ProfileEntityFullRequest} body
   */
  function patchEntity(entityId, body) {
    if (!entityId) throw new Error('useProfileFullApi.patchEntity: entityId requerido')
    return patch(`/api/account/profile/entity/${entityId}`, body)
  }

  /**
   * Upload doc adicional KYC del owner. Multipart: file + documentType + opcionales.
   * @param {FormData} formData
   * @returns {Promise<import('./types').DocumentUploadResponse>}
   */
  function uploadPersonDocument(formData) {
    return postMultipart('/api/account/profile/documents/person', formData)
  }

  /**
   * Upload doc adicional KYB del entity. Requiere SETTINGS_MERCHANT.
   * @param {string} entityId
   * @param {FormData} formData
   */
  function uploadEntityDocument(entityId, formData) {
    if (!entityId) throw new Error('useProfileFullApi.uploadEntityDocument: entityId requerido')
    return postMultipart(`/api/account/profile/documents/entity/${entityId}`, formData)
  }

  /**
   * GET /api/account/profile/business-profile — devuelve perfil comercial. 404 si no se creó.
   * El caller maneja el 404 como "estado DRAFT vacío" (form en blanco).
   * @returns {Promise<import('./types').BusinessProfileResponse>}
   */
  function getBusinessProfile() { return get('/api/account/profile/business-profile') }

  /**
   * PUT /api/account/profile/business-profile — upsert idempotente. Requiere SETTINGS_MERCHANT.
   * Tira 409 si profileStatus ∈ {SUBMITTED, IN_REVIEW, APPROVED}.
   * @param {import('./types').BusinessProfileRequest} body
   * @returns {Promise<import('./types').BusinessProfileResponse>}
   */
  function putBusinessProfile(body) { return put('/api/account/profile/business-profile', body) }

  /**
   * POST /api/account/profile/submit-for-full — DRAFT → SUBMITTED. Requiere SETTINGS_MERCHANT.
   * Pre-checks server-side: residentialAddress en Person + registeredAddress en primary entity.
   * Si falla → 409 `kyb_invalid_data` con detail.
   */
  function submitForFull() { return post('/api/account/profile/submit-for-full') }

  /**
   * Polling visibility-aware del business_profile. Idéntico al pollStatus del wizard pero
   * apunta al endpoint del profile FULL. Stop al llegar a APPROVED/REJECTED.
   * MORE_INFO_REQUIRED es un "stop con notify" — la UI re-abre el form para editar.
   *
   * @param {{
   *   onChange: (bp: import('./types').BusinessProfileResponse) => void,
   *   onError?: (err: unknown) => void,
   *   initialState?: import('./types').BusinessProfileStatus,
   *   fastIntervalMs?: number,
   *   slowIntervalMs?: number,
   *   slowAfterMs?: number,
   * }} opts
   * @returns {{ start: () => void, stop: () => void }}
   */
  function pollBusinessProfile(opts) {
    const fastInterval = opts.fastIntervalMs ?? 15_000
    const slowInterval = opts.slowIntervalMs ?? 30_000
    const slowAfter = opts.slowAfterMs ?? 2 * 60_000
    const TERMINAL = new Set(['APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED'])

    let timer = null
    let pollStartedAt = 0
    let lastState = opts.initialState ?? null
    let stopped = true

    const isVisible = () => typeof document === 'undefined' || document.visibilityState === 'visible'

    async function tick() {
      if (stopped) return
      if (!isVisible()) { schedule(); return }
      try {
        const bp = await getBusinessProfile()
        const newState = bp?.profileStatus
        if (newState && newState !== lastState) {
          lastState = newState
          opts.onChange(bp)
        }
        if (newState && TERMINAL.has(newState)) {
          stop()
          return
        }
      } catch (err) {
        // 404 BP no existe — significa "todavía DRAFT vacío", no error. NO emitir onError.
        if (err instanceof ApiError && err.status === 404) {
          /* ignore */
        } else {
          opts.onError?.(err)
        }
      }
      schedule()
    }

    function schedule() {
      if (stopped) return
      const elapsed = Date.now() - pollStartedAt
      timer = setTimeout(tick, elapsed > slowAfter ? slowInterval : fastInterval)
    }

    function onVisibilityChange() {
      if (stopped) return
      if (isVisible()) {
        clearTimeout(timer)
        tick()
      }
    }

    function startPolling() {
      stopped = false
      pollStartedAt = Date.now()
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', onVisibilityChange)
      }
      tick()
    }

    function stop() {
      stopped = true
      if (timer) clearTimeout(timer)
      timer = null
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange)
      }
    }

    return { start: startPolling, stop }
  }

  return {
    getProfile,
    patchPerson,
    patchEntity,
    uploadPersonDocument,
    uploadEntityDocument,
    getBusinessProfile,
    putBusinessProfile,
    submitForFull,
    pollBusinessProfile,
  }
}
