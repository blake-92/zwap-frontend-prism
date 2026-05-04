import { defineStore } from 'pinia'
import { get, post, patch, del } from '~/utils/api'

// Fuente de verdad para sucursales del merchant del user logueado.
//
// El backend devuelve TODAS las branches del merchant (filtradas por scope si el user es
// scoped a algunas — ej. RECEPTIONIST). Acá guardamos el array crudo + el id de la branch
// "activa" (selector top-right del header) que se persiste en cookie `zwap_active_branch`
// para sobrevivir reloads.
//
// Importante (cutover doc § 4.1): el branchId activo es estado del FRONTEND solo.
// No se manda al backend hasta fase 2 (POST /api/account/active-branch). Mientras tanto se
// usa para filtrado client-side cuando el endpoint no soporta `?branchId=`.

export const useBranchesStore = defineStore('branches', {
  state: () => ({
    items: [],          // BranchView[] — { id, name, code, isPrimary, status, createdAt, updatedAt }
    loading: false,
    error: null,
    activeBranchId: null,
  }),

  getters: {
    active: (state) => state.items.filter((b) => b.status === 'ACTIVE'),
    archived: (state) => state.items.filter((b) => b.status === 'ARCHIVED'),
    primary: (state) => state.items.find((b) => b.isPrimary) ?? null,
    byId: (state) => (id) => state.items.find((b) => b.id === id) ?? null,
    activeBranch(state) {
      if (!state.activeBranchId) return null
      return state.items.find((b) => b.id === state.activeBranchId) ?? null
    },
  },

  actions: {
    async fetch() {
      this.loading = true
      this.error = null
      try {
        const data = await get('/api/branches')
        this.items = Array.isArray(data) ? data : []
        this.hydrateActiveBranch()
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    // Decide qué branch queda "activa" tras refrescar la lista:
    //   1. Si hay cookie `zwap_active_branch` y apunta a una branch ACTIVE → usar esa
    //   2. Si no, primary
    //   3. Si no, primera ACTIVE
    //   4. Si no, null
    hydrateActiveBranch() {
      const fromCookie = this.readCookie()
      const isActive = (id) => this.items.some((b) => b.id === id && b.status === 'ACTIVE')

      if (fromCookie && isActive(fromCookie)) {
        this.activeBranchId = fromCookie
        return
      }
      const primary = this.items.find((b) => b.isPrimary && b.status === 'ACTIVE')
      if (primary) {
        this.setActive(primary.id)
        return
      }
      const firstActive = this.items.find((b) => b.status === 'ACTIVE')
      if (firstActive) {
        this.setActive(firstActive.id)
        return
      }
      this.activeBranchId = null
    },

    setActive(id) {
      this.activeBranchId = id
      try {
        useCookie('zwap_active_branch', { sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 }).value = id
      } catch { /* SSR: ignorar */ }
    },

    readCookie() {
      try {
        return useCookie('zwap_active_branch', { sameSite: 'lax', path: '/' }).value || null
      } catch { return null }
    },

    async create({ name, code = null, isPrimary = false }) {
      // El DTO backend usa primitive `boolean` para isPrimary — Jackson rechaza null y devuelve
      // 400 si el field no viene en el body. Siempre lo mandamos explícito.
      const body = { name, isPrimary }
      if (code) body.code = code
      const branch = await post('/api/branches', body)
      this.items = [...this.items, branch]
      return branch
    },

    async update(id, body) {
      const updated = await patch(`/api/branches/${id}`, body)
      this.items = this.items.map((b) => (b.id === id ? updated : b))
      return updated
    },

    async archive(id) {
      // Backend: DELETE /api/branches/{id} hace soft archive (status → ARCHIVED).
      // M4: optimistic update CON rollback. Mutamos local antes del network hop para que
      // la UI reaccione inmediatamente, pero si el backend rechaza (409 último OWNER, etc.)
      // restauramos el state previo. Sin rollback el state quedaba inconsistente con el backend.
      const previous = this.items.find((b) => b.id === id)
      if (!previous) return
      this.items = this.items.map((b) => (b.id === id ? { ...b, status: 'ARCHIVED' } : b))
      try {
        await del(`/api/branches/${id}`)
      } catch (err) {
        this.items = this.items.map((b) => (b.id === id ? previous : b))
        throw err
      }
    },

    async reactivate(id) {
      const updated = await post(`/api/branches/${id}/reactivate`)
      this.items = this.items.map((b) => (b.id === id ? updated : b))
      return updated
    },

    clear() {
      this.items = []
      this.activeBranchId = null
      this.error = null
    },
  },
})
