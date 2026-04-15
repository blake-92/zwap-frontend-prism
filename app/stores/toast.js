import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [],
  }),
  actions: {
    addToast(message, type = 'success', duration = 3000) {
      const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`
      this.toasts.push({ id, message, type })

      if (duration) {
        setTimeout(() => {
          this.toasts = this.toasts.filter(t => t.id !== id)
        }, duration)
      }
    },
    removeToast(id) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
  },
})
