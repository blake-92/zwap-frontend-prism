import { defineStore } from 'pinia'
import { get, post, patch, del } from '~/utils/api'

// Fuente de verdad para users del merchant del user logueado.
//
// Compartido entre UsuariosView (CRUD principal) y SucursalesView (contador "X usuarios
// asignados" derivado de roles[].branchId). Mantener en un solo store evita doble fetch
// cuando el usuario navega entre las dos vistas.

export const useUsersStore = defineStore('users', {
  state: () => ({
    items: [],          // UserView[] — { id, email, fullName, status, lastLoginAt, createdAt, roles[] }
    loading: false,
    error: null,
  }),

  getters: {
    byId: (state) => (id) => state.items.find((u) => u.id === id) ?? null,
    countByBranch: (state) => (branchId) =>
      state.items.filter((u) => u.roles?.some((r) => r.branchId === branchId)).length,
  },

  actions: {
    async fetch() {
      this.loading = true
      this.error = null
      try {
        const data = await get('/api/users')
        this.items = Array.isArray(data) ? data : []
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    async invite({ email, fullName, roleAssignments }) {
      // POST /api/users → { user: UserView, inviteEmailSent: boolean }.
      const result = await post('/api/users', { email, fullName, roleAssignments })
      if (result?.user) this.items = [...this.items, result.user]
      return result
    },

    async updateRoles(id, assignments) {
      // PATCH /api/users/{id}/roles reemplaza TODAS las asignaciones (no es delta).
      const updated = await patch(`/api/users/${id}/roles`, { assignments })
      this.items = this.items.map((u) => (u.id === id ? updated : u))
      return updated
    },

    async suspend(id) {
      const updated = await post(`/api/users/${id}/suspend`)
      this.items = this.items.map((u) => (u.id === id ? updated : u))
      return updated
    },

    async reactivate(id) {
      const updated = await post(`/api/users/${id}/reactivate`)
      this.items = this.items.map((u) => (u.id === id ? updated : u))
      return updated
    },

    async archive(id) {
      // DELETE soft-archive (status → ARCHIVED). Backend devuelve 409 si último OWNER.
      // M4: optimistic con rollback. Si backend rechaza (409 último OWNER, 403 sin permiso),
      // restauramos el state previo para que la UI no mienta.
      const previous = this.items.find((u) => u.id === id)
      if (!previous) return
      this.items = this.items.map((u) => (u.id === id ? { ...u, status: 'ARCHIVED' } : u))
      try {
        await del(`/api/users/${id}`)
      } catch (err) {
        this.items = this.items.map((u) => (u.id === id ? previous : u))
        throw err
      }
    },

    clear() {
      this.items = []
      this.error = null
    },
  },
})
