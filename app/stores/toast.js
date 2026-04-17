import { defineStore } from 'pinia'

// Timers fuera del state para no triggerar renders al mutarlos.
const timers = new Map()

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
        const tid = setTimeout(() => {
          timers.delete(id)
          this.toasts = this.toasts.filter(t => t.id !== id)
        }, duration)
        timers.set(id, tid)
      }
    },
    removeToast(id) {
      const tid = timers.get(id)
      if (tid) { clearTimeout(tid); timers.delete(id) }
      this.toasts = this.toasts.filter(t => t.id !== id)
    },
  },
})
