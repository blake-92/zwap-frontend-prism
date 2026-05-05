import { get, post, patch, postMultipart, ApiError } from '~/utils/api'
import { useKybDraft } from '~/composables/kyb/useKybDraft'
import './types' // JSDoc-only side-effect import (mantiene typedefs accesibles para JSDoc resolver)

/**
 * Composable que envuelve todos los endpoints del wizard KYB anónimo.
 *
 * Convenciones:
 *   - Auto-inyecta `X-KYB-Application-Token` desde useKybDraft cuando hay draft activo. La
 *     cookie httpOnly del backend (`kyb_application_token`, Path=/api/kyb) viaja sola; el
 *     header es fallback explícito para Safari ITP / iframes.
 *   - Pasa `noAuth: true` a todos los calls del wizard. Estos endpoints son públicos (capability
 *     token), no JWT — un 401/404 NO debe disparar el refresh interceptor del JWT del usuario
 *     potencialmente logueado en otra tab.
 *   - Errores se mapean al `ApiError` estándar del wrapper. Los consumers leen `error.code`
 *     (ej. `'kyb_invalid_data'`) y `error.message` (detail legible del backend).
 *
 * Códigos KYB que el frontend debe distinguir (del doc backend §2):
 *   - 404 `kyb_application_not_found` → token inválido o draft expirado (TTL 30d)
 *   - 409 `kyb_invalid_state` → submit cuando no está en DRAFT (re-entrada al review)
 *   - 409 `kyb_invalid_data` → validación falló — `detail` lo explica (faltan docs, taxId mal,
 *     edad < 18, BO < threshold, MIME inválido, archivo vacío)
 *   - 413 `kyb_file_too_large` → > 10 MB
 *   - 400 `kyb_missing_part` → multipart sin part `file`
 *   - 429 → rate limit (KYB_PUBLIC_QUERY 60/min/IP)
 *
 * @returns API del wizard.
 */
export function useKybApi() {
  const draft = useKybDraft()

  function withAuth(opts = {}) {
    return {
      ...opts,
      noAuth: true,
      headers: {
        ...draft.authHeaders(),
        ...(opts.headers ?? {}),
      },
    }
  }

  function path(suffix) {
    if (!draft.applicationId.value) {
      throw new Error('useKybApi: no hay draft activo. Llamar start() primero o recover() en mount.')
    }
    return `/api/kyb/${draft.applicationId.value}${suffix}`
  }

  /**
   * POST /api/kyb/start — crea draft + persiste applicationId/Token via useKybDraft.
   * @param {import('./types').KybStartRequest} [body]
   * @returns {Promise<import('./types').KybStartResponse>}
   */
  async function start(body = {}) {
    const result = await post('/api/kyb/start', body, { noAuth: true })
    if (result?.applicationId && result?.applicationToken) {
      draft.start({ applicationId: result.applicationId, applicationToken: result.applicationToken })
    }
    return result
  }

  /**
   * GET /api/kyb/{id} — estado actual del draft.
   * @returns {Promise<import('./types').KybApplicationView>}
   */
  function getApplication() {
    return get(path(''), withAuth())
  }

  /** PATCH step 1 — KYC del owner + PEP. @param {import('./types').Step1PersonRequest} body */
  function patchStep1Person(body) { return patch(path('/step-1-person'), body, withAuth()) }

  /** PATCH step 2 — entity primary. @param {import('./types').Step2EntityRequest} body */
  function patchStep2Entity(body) { return patch(path('/step-2-entity'), body, withAuth()) }

  /** PATCH step 3 — roles (replace). @param {import('./types').Step3RolesRequest} body */
  function patchStep3Roles(body) { return patch(path('/step-3-role'), body, withAuth()) }

  /** PATCH step 4 — entity adicional (opcional, multi-entity). @param {import('./types').Step4AdditionalEntityRequest} body */
  function patchStep4AdditionalEntity(body) { return patch(path('/step-4-additional-entity'), body, withAuth()) }

  /** PATCH step 5 — merchant + branches. @param {import('./types').Step5MerchantRequest} body */
  function patchStep5Merchant(body) { return patch(path('/step-5-merchant'), body, withAuth()) }

  /**
   * Upload doc del owner (multipart). El caller arma el FormData con file + documentType
   * (+ documentCountry, documentNumber, documentExpiry opcionales).
   * @param {FormData} formData
   * @returns {Promise<import('./types').DocumentUploadResponse>}
   */
  function uploadPersonDocument(formData) { return postMultipart(path('/documents/person'), formData, withAuth()) }

  /** Upload doc del entity. @param {FormData} formData */
  function uploadEntityDocument(formData) { return postMultipart(path('/documents/entity'), formData, withAuth()) }

  /**
   * POST /submit — DRAFT → SUBMITTED. Tira 409 `kyb_invalid_data` si falta algo (docs, etc.)
   * y 409 `kyb_invalid_state` si no está en DRAFT.
   */
  function submit() { return post(path('/submit'), undefined, withAuth()) }

  /**
   * POST /inherit-person — reusar Person verificada del usuario logueado. Skip step-1.
   * Requiere que el caller esté autenticado (tiene zwap_token) Y que el ownerEmail matchee.
   * Por eso este call NO va con noAuth — necesita el JWT.
   */
  function inheritPerson() {
    return post(path('/inherit-person'), undefined, {
      headers: { ...draft.authHeaders() },
    })
  }

  /**
   * GET /api/kyb/economic-activities — autocomplete de catálogo (CAEB BO / NAICS US).
   * @param {{ jurisdiction: string, q: string }} params
   * @returns {Promise<import('./types').EconomicActivityResult[]>}
   */
  function searchEconomicActivities({ jurisdiction, q }) {
    const qs = new URLSearchParams({ jurisdiction, q }).toString()
    return get(`/api/kyb/economic-activities?${qs}`, { noAuth: true })
  }

  /**
   * Polling visibility-aware del estado del draft.
   *
   * Doc §1 de phase-2-backend-questions: 15s con back-off a 30s después de 2min, solo con tab
   * visible. Si el state pasa a APPROVED/REJECTED/MORE_INFO_REQUIRED → callback `onChange` y
   * stop. Si el GET devuelve 404 (draft expirado) → callback `onExpired` y stop.
   *
   * El polling NO arranca solo. El caller llama `start()` para iniciar y la función devuelta
   * para parar (cleanup en onUnmounted).
   *
   * @param {{
   *   onChange: (app: import('./types').KybApplicationView) => void,
   *   onExpired?: () => void,
   *   onError?: (err: unknown) => void,
   *   initialState?: import('./types').KybApplicationState,
   *   fastIntervalMs?: number,
   *   slowIntervalMs?: number,
   *   slowAfterMs?: number,
   * }} opts
   * @returns {{ start: () => void, stop: () => void }}
   */
  function pollStatus(opts) {
    const fastInterval = opts.fastIntervalMs ?? 15_000
    const slowInterval = opts.slowIntervalMs ?? 30_000
    const slowAfter = opts.slowAfterMs ?? 2 * 60_000
    const TERMINAL_STATES = new Set(['APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED'])

    let timer = null
    let pollStartedAt = 0
    let lastState = opts.initialState ?? null
    let stopped = true

    function isVisible() {
      return typeof document === 'undefined' || document.visibilityState === 'visible'
    }

    async function tick() {
      if (stopped) return
      if (!isVisible()) {
        // tab oculta — re-schedule sin pegar al backend
        schedule()
        return
      }
      try {
        const app = await getApplication()
        const newState = app?.state
        if (newState && newState !== lastState) {
          lastState = newState
          opts.onChange(app)
        }
        if (newState && TERMINAL_STATES.has(newState)) {
          stop()
          return
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          stop()
          opts.onExpired?.()
          return
        }
        opts.onError?.(err)
      }
      schedule()
    }

    function schedule() {
      if (stopped) return
      const elapsed = Date.now() - pollStartedAt
      const interval = elapsed > slowAfter ? slowInterval : fastInterval
      timer = setTimeout(tick, interval)
    }

    function onVisibilityChange() {
      if (stopped) return
      if (isVisible()) {
        // Reanuda con tick inmediato — el user volvió a la tab y querrá el state fresco.
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
    draft,
    start,
    getApplication,
    patchStep1Person,
    patchStep2Entity,
    patchStep3Roles,
    patchStep4AdditionalEntity,
    patchStep5Merchant,
    uploadPersonDocument,
    uploadEntityDocument,
    submit,
    inheritPerson,
    searchEconomicActivities,
    pollStatus,
  }
}
