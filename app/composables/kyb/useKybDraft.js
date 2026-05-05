import { ref, computed, readonly } from 'vue'

/**
 * Persistencia del draft KYB anónimo.
 *
 * Modelo de identidad del wizard:
 *   - `applicationId` (uuid) — id público, va en la URL `PATCH /api/kyb/{id}/...`.
 *   - `applicationToken` (raw) — capability token que prueba ownership del draft. Se manda
 *     vía cookie `kyb_application_token` (httpOnly, Path=/api/kyb, 30 días) que el backend
 *     setea automáticamente en `POST /start`. El header `X-KYB-Application-Token` es fallback
 *     para Safari ITP, iframes con cookies third-party bloqueadas, o WebView raros.
 *
 * ¿Por qué guardamos el token raw en localStorage si el backend ya lo manda como cookie?
 *   - **Safari ITP** rota cookies cross-site después de 7 días si el origin no fue visitado
 *     directamente. Si el user tarda más de 7 días en completar el wizard (caso normal: empieza,
 *     busca documentos, vuelve días después), la cookie se cae y el draft "desaparece". El header
 *     fallback resuelve eso.
 *   - **iframes / embeds** — algunos browsers bloquean cookies third-party total. El header viaja
 *     por config explícita.
 *   - **Multi-device handoff** futuro — el día que querramos QR o link "continuar en otro device",
 *     el token está disponible para serializar (NO va a pasar acá pero queda la puerta abierta).
 *
 * El token es BEARER-equivalent: cualquiera con el token puede leer/editar el draft. NO loggear,
 * NO mandar a analytics. localStorage en SPA mismo origin es aceptable (mismo riesgo que XSS
 * para cualquier cookie no-httpOnly; el wizard es público anónimo así que no hay PII de otros
 * users en la sesión).
 *
 * Ciclo de vida:
 *   1. Wizard arranca → `start({ applicationId, applicationToken })` lo persiste.
 *   2. Cualquier reload del browser → `recover()` lo recupera de localStorage.
 *   3. Submit OK / 30 días sin actividad / user cancela → `clear()` lo wipea.
 *
 * SSR-safe: todos los accesos a localStorage van envueltos en try/catch + guard typeof.
 */

const STORAGE_KEY_ID = 'zwap-kyb-application-id'
const STORAGE_KEY_TOKEN = 'zwap-kyb-application-token'
const STORAGE_KEY_STARTED_AT = 'zwap-kyb-started-at'
// El backend expira drafts a los 30 días. El frontend usa la misma ventana para decidir si
// recuperar o tirar a la basura — si el localStorage tiene un draft de hace > 30 días, NO lo
// recuperamos (probablemente el backend ya lo borró y `GET /api/kyb/{id}` daría 404).
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000

// State module-level — un wizard a la vez por tab. Al ser composable singleton evita que dos
// componentes en simultáneo (ej. Stepper + step actual) lean estados desincronizados.
const applicationId = ref(null)
const applicationToken = ref(null)
const startedAt = ref(null)
let hydrated = false

function safeRead(key) {
  if (typeof localStorage === 'undefined') return null
  try { return localStorage.getItem(key) } catch { return null }
}

function safeWrite(key, value) {
  if (typeof localStorage === 'undefined') return
  try {
    if (value == null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch { /* quota / safari private — silencio, el wizard sigue funcionando con state en memoria */ }
}

/**
 * Composable singleton del draft KYB.
 *
 * @returns {{
 *   applicationId: import('vue').Ref<string|null>,
 *   applicationToken: import('vue').Ref<string|null>,
 *   hasDraft: import('vue').ComputedRef<boolean>,
 *   isExpired: import('vue').ComputedRef<boolean>,
 *   start: (data: { applicationId: string, applicationToken: string }) => void,
 *   clear: () => void,
 *   recover: () => boolean,
 *   authHeaders: () => Record<string, string>,
 * }}
 */
export function useKybDraft() {
  // Lazy hydrate la primera vez que el composable se usa en el browser. SSR no toca localStorage.
  if (!hydrated && typeof window !== 'undefined') {
    recover()
    hydrated = true
  }

  function start({ applicationId: id, applicationToken: token }) {
    if (!id || !token) {
      throw new Error('useKybDraft.start: applicationId y applicationToken son requeridos')
    }
    applicationId.value = id
    applicationToken.value = token
    startedAt.value = Date.now()
    safeWrite(STORAGE_KEY_ID, id)
    safeWrite(STORAGE_KEY_TOKEN, token)
    safeWrite(STORAGE_KEY_STARTED_AT, String(startedAt.value))
  }

  function clear() {
    applicationId.value = null
    applicationToken.value = null
    startedAt.value = null
    safeWrite(STORAGE_KEY_ID, null)
    safeWrite(STORAGE_KEY_TOKEN, null)
    safeWrite(STORAGE_KEY_STARTED_AT, null)
  }

  /**
   * Recupera el draft de localStorage si no está expirado. Si está expirado, limpia y devuelve false.
   * @returns {boolean} true si recuperó draft válido.
   */
  function recover() {
    const id = safeRead(STORAGE_KEY_ID)
    const token = safeRead(STORAGE_KEY_TOKEN)
    const startedAtRaw = safeRead(STORAGE_KEY_STARTED_AT)
    if (!id || !token) return false

    const ts = startedAtRaw ? Number.parseInt(startedAtRaw, 10) : 0
    const expired = !ts || (Date.now() - ts) > DRAFT_TTL_MS
    if (expired) {
      clear()
      return false
    }
    applicationId.value = id
    applicationToken.value = token
    startedAt.value = ts
    return true
  }

  /**
   * Headers para las requests del wizard. Vacío si no hay draft activo.
   * El composable de API los inyecta automáticamente; el caller no necesita esto a mano.
   */
  function authHeaders() {
    return applicationToken.value
      ? { 'X-KYB-Application-Token': applicationToken.value }
      : {}
  }

  const hasDraft = computed(() => Boolean(applicationId.value && applicationToken.value))
  const isExpired = computed(() => {
    if (!startedAt.value) return false
    return (Date.now() - startedAt.value) > DRAFT_TTL_MS
  })

  return {
    applicationId: readonly(applicationId),
    applicationToken: readonly(applicationToken),
    hasDraft,
    isExpired,
    start,
    clear,
    recover,
    authHeaders,
  }
}

// Test-only: resetea el state singleton entre specs. NO usar en código de prod.
// Dynamic-import-friendly: en runtime real este export se importa pero nunca se llama.
export function __resetKybDraftForTests() {
  applicationId.value = null
  applicationToken.value = null
  startedAt.value = null
  hydrated = false
}
