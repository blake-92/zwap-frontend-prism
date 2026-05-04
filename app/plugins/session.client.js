import { useSessionStore } from '~/stores/session'

// Hidrata user/merchant/permissions desde GET /api/account/me al boot del SPA si la cookie
// `zwap_session` está presente. Sin esto, después de un reload el state en memoria queda vacío
// y el sidebar/header tienen que mostrar mock o spinner indefinido.
//
// El plugin es async: bloquea el mount del root component hasta que /me responda. En local
// son ~50ms; el browser muestra el splash de Nuxt mientras tanto.
//
// Si /me devuelve 401, el wrapper api.js ya limpia la cookie + redirige a /login dentro de
// handleAuthFailure — acá solo silenciamos el throw para que el plugin no aborte el mount.
// Si es un error de red (sin status), seguimos con user=null; las vistas que dependan de
// session.user tienen que tolerarlo (por ej. el sidebar muestra fallback).
export default defineNuxtPlugin(async () => {
  const session = useSessionStore()
  if (!session.isAuthenticated || session.user) return
  try {
    await session.fetchMe()
  } catch { /* 401 ya redirige; otros errores se manejan en la vista */ }
})
