import { defineStore } from 'pinia'
import { get, post } from '~/utils/api'

// Sesión del usuario logueado. Espejo en memoria del payload que devuelve /api/auth/login y
// /api/account/me. La cookie `zwap_session` (no httpOnly, seteada por el backend en cada login/refresh)
// es la fuente de verdad para "estoy logueado" — sobrevive reloads. El estado en memoria sobrevive
// solo dentro del SPA y se rehidrata desde /me cuando arranca la app si la cookie está presente.
export const useSessionStore = defineStore('session', {
  state: () => ({
    user: null,         // { id, email, fullName }
    merchant: null,     // { id, businessName, activationLevel, kybState } — null cuando scope=zwap_admin
    permissions: [],    // catálogo de 23 permisos (códigos string)
    expiresAt: null,    // epoch ms — calculado desde expiresIn del login
  }),

  getters: {
    isAuthenticated() {
      // Reactivo: useCookie devuelve un Ref que Vue trackea. Cuando el backend setea/expira la cookie
      // via Set-Cookie, el composable la detecta y este getter se re-evalúa.
      try {
        return Boolean(useCookie('zwap_session').value)
      } catch {
        return false
      }
    },
    displayName: (state) => state.user?.fullName ?? state.user?.email ?? '',
    hasPermission: (state) => (code) => state.permissions.includes(code),
    // Único punto de lectura del nivel de activación. Default 'NONE' cubre 2 casos:
    //   - scope=zwap_admin (cross-tenant, sin merchant)
    //   - merchant cargado pero campo aún no propagado (defensivo)
    activationLevel: (state) => state.merchant?.activationLevel ?? 'NONE',
    // Estado del KYB del merchant. Único punto de lectura para banners ("en review", MORE_INFO),
    // routing post-login y copy condicional. Default 'DRAFT' cuando no hay merchant.
    kybState: (state) => state.merchant?.kybState ?? 'DRAFT',
  },

  actions: {
    async login({ email, password }) {
      const data = await post('/api/auth/login', { email, password })
      this.user = data.user
      this.merchant = data.merchant
      this.permissions = data.permissions ?? []
      this.expiresAt = data.expiresIn ? Date.now() + data.expiresIn * 1000 : null
      return data
    },

    async fetchMe() {
      const data = await get('/api/account/me')
      this.user = data.user
      this.merchant = data.merchant
      this.permissions = data.permissions ?? []
      return data
    },

    async logout() {
      // best-effort: el endpoint es idempotente (204 incluso sin cookie). Un error de red NO debe
      // dejar al user con la UI "logueada" — la limpieza local corre siempre.
      try { await post('/api/auth/logout') } catch { /* swallow */ }
      this.clear()
    },

    clear() {
      this.user = null
      this.merchant = null
      this.permissions = []
      this.expiresAt = null
      // Backup local: el backend ya manda Set-Cookie con Max-Age=0 en logout, pero si el call falló
      // (network error) limpiamos la cookie acá para que la UI deje de reportarse logueada.
      try {
        useCookie('zwap_session', { sameSite: 'lax', path: '/' }).value = null
      } catch { /* SSR/edge: ignorar */ }
    },
  },
})
