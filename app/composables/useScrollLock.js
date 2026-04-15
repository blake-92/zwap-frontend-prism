import { watch, onUnmounted, toValue } from 'vue'

/**
 * useScrollLock — bloquea <main> mientras hay overlays activos.
 * Acepta un Ref<boolean>, getter o boolean estático.
 */
export function useScrollLock(active) {
  let locked = false

  const engage = () => {
    if (locked || typeof document === 'undefined') return
    const el = document.documentElement
    const count = parseInt(el.dataset.overlayCount || '0', 10)
    el.dataset.overlayCount = String(count + 1)
    el.classList.add('has-overlay')
    locked = true
  }

  const release = () => {
    if (!locked || typeof document === 'undefined') return
    const el = document.documentElement
    const next = parseInt(el.dataset.overlayCount || '1', 10) - 1
    el.dataset.overlayCount = String(next)
    if (next <= 0) {
      el.classList.remove('has-overlay')
      delete el.dataset.overlayCount
    }
    locked = false
  }

  watch(
    () => !!toValue(active),
    (on) => (on ? engage() : release()),
    { immediate: true },
  )

  onUnmounted(release)
}
