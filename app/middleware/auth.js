import { isSafeInternalPath, ROUTES } from '~/utils/routes'
import { refreshSession } from '~/utils/api'

// Lee zwap_session (no httpOnly, seteada por el backend en login/refresh).
// zwap_token es httpOnly y NO accesible desde JS — por eso este middleware no la lee.
//
// Refresh transparente (caso "tab idle >15min" o "PC despierta del sleep"):
//   El backend setea `zwap_session` con TTL 15min (igual al access token). Pero `zwap_refresh`
//   vive 30 días. Si la cookie de session expiró, NO podemos asumir sesión muerta — primero
//   intentamos POST /api/auth/refresh (el browser adjunta zwap_refresh automáticamente porque
//   el path coincide). Solo si refresh devuelve 401 explícito mandamos al usuario a login.
//   Esto es lo que evita que un recepcionista en operación continua sea pateado al login
//   cada 15min de inactividad — el contrato real del backend es 30 días, no 15min.
//
// Permission gating (Plan C):
//   - Pages declaran `definePageMeta({ middleware: 'auth', requiresPermission: 'X' })`.
//   - `requiresPermission` puede ser un string ('USERS_VIEW') o array (any-of):
//       ['DASHBOARD_OPS_VIEW', 'DASHBOARD_ANALYTICS_VIEW']
//   - Si el user no tiene NINGUNO de los permisos requeridos → redirect a /app/dashboard
//     (la home segura que NO declara requiresPermission, así nunca hay loop).
//   - Si la page no declara `requiresPermission` → solo se valida auth (cookie).
//
// Race con hidratación:
//   El plugin `session.client.js` es async y bloquea el mount del root component. Cuando este
//   middleware corre (después del plugin), `sessionStore.permissions[]` ya está hidratada desde
//   `/api/account/me`. Si el fetchMe falló por network, permissions queda [] y el user es
//   redirigido a /app/dashboard (que no requiere permisos) → no loop, vista degradada.
const goLogin = (to) => {
  const candidate = to.fullPath
  const redirect = candidate && candidate !== '/' && isSafeInternalPath(candidate) ? candidate : undefined
  return navigateTo({
    path: ROUTES.LOGIN,
    query: redirect ? { redirect } : undefined,
  })
}

export default defineNuxtRouteMiddleware(async (to) => {
  const session = useCookie('zwap_session', { sameSite: 'lax', path: '/' })

  if (!session.value) {
    // zwap_session expiró (15min TTL) pero zwap_refresh puede seguir vivo (30d).
    // Intentar refresh transparente antes de mandar a login.
    const result = await refreshSession()

    if (result === 'fatal') {
      // 401 explícito: refresh expirado, user suspendido, merchant inactivo, o reuse-detection.
      // El backend ya invalidó la sesión server-side; solo redirigimos.
      return goLogin(to)
    }
    if (result === 'network-error') {
      // Sin conexión / backend caído. Mandamos a login con toast distinto al de sesión muerta:
      // el usuario tiene que entender que es problema de red, no que su cuenta vence.
      try {
        const { $i18n } = useNuxtApp()
        useToastStore().addToast($i18n.t('errors.sessionRefreshNetworkError'), 'error', 3500)
      } catch { /* i18n no inicializado: silencio */ }
      return goLogin(to)
    }

    // result === 'ok': el backend rotó las 3 cookies. Re-hidratar sessionStore para que las
    // vistas tengan user/permissions/merchant frescos. Si fetchMe falla acá es un caso raro
    // (refresh OK pero /me roto) — degradamos a login.
    try {
      const sessionStore = useSessionStore()
      await sessionStore.fetchMe()
    } catch {
      return goLogin(to)
    }
    // continuar al permission check abajo
  }

  const required = to.meta?.requiresPermission
  if (!required) return

  const sessionStore = useSessionStore()
  const list = Array.isArray(required) ? required : [required]
  const ok = list.some((perm) => sessionStore.hasPermission(perm))
  if (ok) return

  // Sin permiso: redirect a dashboard (home segura) + toast informativo.
  // Toast vía useNuxtApp porque el middleware vive fuera de un setup context.
  try {
    const { $i18n } = useNuxtApp()
    const toastStore = useToastStore()
    toastStore.addToast($i18n.t('errors.noAccessRedirected'), 'error', 3500)
  } catch { /* i18n/toast no inicializado todavía: silencio, solo redirect */ }

  // Guard anti-loop: si por algún motivo el target de fallback también está restringido
  // (no debería pasar — dashboard nunca declara requiresPermission), mandar a /login.
  if (to.path === ROUTES.DASHBOARD) {
    return navigateTo({ path: ROUTES.LOGIN })
  }
  return navigateTo({ path: ROUTES.DASHBOARD })
})
