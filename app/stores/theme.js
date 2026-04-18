import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false,
    _hydrated: false,
  }),
  actions: {
    hydrate() {
      if (this._hydrated || typeof window === 'undefined') return
      let stored = null
      try { stored = localStorage.getItem('zwap-theme') } catch {}
      if (stored) {
        this.isDarkMode = stored === 'dark'
      } else {
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      this._hydrated = true
      this.apply()
    },
    apply() {
      if (typeof document === 'undefined') return
      document.documentElement.classList.toggle('dark', this.isDarkMode)
      try { localStorage.setItem('zwap-theme', this.isDarkMode ? 'dark' : 'light') } catch {}
    },
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      this.apply()
    },
  },
})
