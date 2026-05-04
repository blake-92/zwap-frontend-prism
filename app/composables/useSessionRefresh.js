// Timer proactivo que refresca el access token cada 13 min — antes de que venza a los 15.
// Mientras el usuario está activo, mantiene tokens frescos sin agregar latencia al primer
// click después de un idle. El interceptor de 401 (en `~/utils/api.js`) cubre los casos en
// que el timer no alcanzó: PC durmió, tab en background mucho tiempo, race con el TTL.
//
// Comparte el mismo `refreshPromise` single-flight que el interceptor (vía `refreshSession`
// exportada de api.js). Disparar 2 refresh en paralelo activaría reuse-detection del backend
// y deslogueaba al usuario.
//
// Spec: ~/Developer/zwap-backend/docs/frontend-session-refresh.md (Opción B + caso edge #2).
//
// Reglas:
// - Solo refresca si `zwap_session` está presente (cookie no-httpOnly que JS sí puede leer).
//   Sin sesión, refresh devolvería 401 y ensuciaría logs.
// - Errores del refresh NO limpian estado ni redirigen — solo loguean. El próximo 401 real
//   en una request del usuario será manejado por el interceptor de api.js, que sí redirige.
// - Stop al ocultar la pestaña, restart al volverla visible. Esto resetea el ciclo y evita
//   que un timer "atrasado" durante el sleep de la PC haga refresh inmediatamente al
//   despertar (el dedupe lo cubriría igual, pero ahorra una request innecesaria).

import { onMounted, onUnmounted } from 'vue'
import { refreshSession } from '~/utils/api'

const REFRESH_INTERVAL_MS = 13 * 60 * 1000

export function useSessionRefresh() {
  let timer = null

  const tick = async () => {
    // useCookie() es auto-import Nuxt; lectura sincrónica del valor actual.
    const session = useCookie('zwap_session', { sameSite: 'lax', path: '/' })
    if (!session.value) return
    try {
      await refreshSession()
    } catch (err) {
      // L4: solo loguear status/message sanitizados, no el err completo (puede tener
      // response body con info que no querés en histórico de devtools).
      // Network error o algo no-401: dejamos que el interceptor maneje el próximo 401 real.
      const status = err?.response?.status ?? err?.status ?? 'unknown'
      // eslint-disable-next-line no-console
      console.warn(`[session-refresh] proactive refresh failed (status=${status})`)
    }
  }

  const start = () => {
    stop()
    if (typeof window === 'undefined') return
    timer = setInterval(tick, REFRESH_INTERVAL_MS)
  }

  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  const onVisibilityChange = () => {
    if (typeof document === 'undefined') return
    if (document.visibilityState === 'visible') {
      // PC despertando del sleep o tab volviendo del background: el access token puede haber
      // vencido durante la inactividad. Disparar refresh inmediato (con dedupe global vía
      // refreshSession) antes de que el usuario haga el primer click que vería un 401.
      // No await — el handler debe retornar rápido; el dedupe asegura que un click
      // simultáneo no dispare un segundo refresh en paralelo.
      tick()
      start()
    } else {
      stop()
    }
  }

  onMounted(() => {
    if (typeof document === 'undefined') return
    start()
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
    stop()
  })

  return { start, stop }
}
