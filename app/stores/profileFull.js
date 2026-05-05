import { defineStore } from 'pinia'
import { ApiError } from '~/utils/api'
import { useProfileFullApi } from '~/composables/kyb/useProfileFullApi'

// Source of truth del flow de profile FULL post-aprobación BASIC.
// Espejo en memoria de:
//   - GET /api/account/profile          → person + legalEntities[]
//   - GET /api/account/profile/business-profile → BusinessProfileResponse (404 = sin crear todavía)
//
// El store NO replica useSessionStore.activationLevel/kybState — esos viven con la sesión.
// Acá guardamos solo el detalle del profile editable.
//
// Polling: cuando businessProfile.profileStatus está SUBMITTED|IN_REVIEW, ProfileFullView arranca
// el polling via useProfileFullApi.pollBusinessProfile que pega cada 15s mientras tab visible.

export const useProfileFullStore = defineStore('profileFull', {
  state: () => ({
    person: null,                  // PersonProfile | null
    legalEntities: [],             // LegalEntityProfile[]
    businessProfile: null,         // BusinessProfileResponse | null (null = no creado todavía)
    loading: false,                // GET /profile in flight
    bpLoading: false,              // GET /business-profile in flight
    saving: false,                 // PATCH/PUT in flight (cualquiera)
    lastSavedAt: null,             // ms epoch del último PATCH/PUT OK — para "Saved at hh:mm"
    error: null,                   // string | null — último error legible
  }),

  getters: {
    primaryEntity: (state) => state.legalEntities.find((e) => e.primary) ?? state.legalEntities[0] ?? null,
    additionalEntities: (state) => state.legalEntities.filter((e) => !e.primary),

    // Status derivado del business profile. Default DRAFT cuando no se creó.
    businessProfileStatus: (state) => state.businessProfile?.profileStatus ?? 'DRAFT',

    // Editable solo en estados: DRAFT | MORE_INFO_REQUIRED | REJECTED. Los demás → 409.
    isBusinessProfileEditable() {
      return ['DRAFT', 'MORE_INFO_REQUIRED', 'REJECTED'].includes(this.businessProfileStatus)
    },

    // Pre-checks server-side de submit-for-full: residentialAddress + registeredAddress.
    canSubmit(state) {
      const hasResidential = Boolean(state.person?.residentialAddress?.street)
      const hasRegistered = Boolean(this.primaryEntity?.registeredAddress?.street)
      const hasBusinessProfile = state.businessProfile !== null
      return hasResidential && hasRegistered && hasBusinessProfile && this.isBusinessProfileEditable
    },

    moreInfoRequested: (state) => state.businessProfile?.moreInfoRequested ?? null,
  },

  actions: {
    async fetch() {
      this.loading = true
      this.error = null
      const api = useProfileFullApi()
      try {
        const data = await api.getProfile()
        this.person = data.person ?? null
        this.legalEntities = Array.isArray(data.legalEntities) ? data.legalEntities : []
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : String(err)
        throw err
      } finally {
        this.loading = false
      }
      // Cargar businessProfile en paralelo lógico — 404 = todavía no se creó (estado válido).
      this.bpLoading = true
      try {
        this.businessProfile = await api.getBusinessProfile()
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          this.businessProfile = null
        } else {
          this.error = err instanceof ApiError ? err.message : String(err)
          throw err
        }
      } finally {
        this.bpLoading = false
      }
    },

    async patchPerson(payload) {
      this.saving = true
      this.error = null
      const api = useProfileFullApi()
      try {
        await api.patchPerson(payload)
        // Refresh — el backend devuelve un PersonProfile parcial; pedir el full para que
        // canSubmit y demás getters reflejen el state real.
        const fresh = await api.getProfile()
        this.person = fresh.person ?? this.person
        this.legalEntities = Array.isArray(fresh.legalEntities) ? fresh.legalEntities : this.legalEntities
        this.lastSavedAt = Date.now()
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : String(err)
        throw err
      } finally {
        this.saving = false
      }
    },

    async patchEntity(entityId, payload) {
      this.saving = true
      this.error = null
      const api = useProfileFullApi()
      try {
        await api.patchEntity(entityId, payload)
        const fresh = await api.getProfile()
        this.person = fresh.person ?? this.person
        this.legalEntities = Array.isArray(fresh.legalEntities) ? fresh.legalEntities : this.legalEntities
        this.lastSavedAt = Date.now()
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : String(err)
        throw err
      } finally {
        this.saving = false
      }
    },

    async putBusinessProfile(payload) {
      this.saving = true
      this.error = null
      const api = useProfileFullApi()
      try {
        const updated = await api.putBusinessProfile(payload)
        this.businessProfile = updated
        this.lastSavedAt = Date.now()
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : String(err)
        throw err
      } finally {
        this.saving = false
      }
    },

    async submitForFull() {
      this.saving = true
      this.error = null
      const api = useProfileFullApi()
      try {
        await api.submitForFull()
        // Tras submit el business profile pasa a SUBMITTED. Re-fetch para state fresco.
        try {
          this.businessProfile = await api.getBusinessProfile()
        } catch { /* 404 raro tras submit — silencio */ }
      } catch (err) {
        this.error = err instanceof ApiError ? err.message : String(err)
        throw err
      } finally {
        this.saving = false
      }
    },

    clear() {
      this.person = null
      this.legalEntities = []
      this.businessProfile = null
      this.error = null
      this.lastSavedAt = null
    },
  },
})
