import { defineStore } from 'pinia'
import { shallowRef } from 'vue'

// filterOpener is stored outside reactive state so assigning it doesn't trigger renders.
const filterOpenerRef = shallowRef(null)

export const useViewSearchStore = defineStore('viewSearch', {
  state: () => ({
    query: '',
    placeholder: '',
    hasFilters: false,
    activeFilterCount: 0,
  }),
  actions: {
    setQuery(q) { this.query = q },
    setActiveFilterCount(n) { this.activeFilterCount = n },
    registerView(ph) {
      this.placeholder = ph || ''
      this.query = ''
    },
    unregisterView() {
      this.placeholder = ''
      this.query = ''
      filterOpenerRef.value = null
      this.hasFilters = false
      this.activeFilterCount = 0
    },
    setFilterOpener(fn) {
      filterOpenerRef.value = fn
      this.hasFilters = !!fn
    },
    openFilters() {
      filterOpenerRef.value?.()
    },
  },
})
