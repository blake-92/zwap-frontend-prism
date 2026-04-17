import { watch, onUnmounted, toValue } from 'vue'

/**
 * Signals to chrome (Sidebar/BottomNav) that a full-attention overlay is active
 * so they apply a blur filter. Accepts a Ref<boolean>/getter indicating whether
 * the overlay is present.
 */
export function useChromeBlur(active) {
  let engaged = false

  const engage = () => {
    if (engaged || typeof document === 'undefined') return
    const count = parseInt(document.body.dataset.modalCount || '0', 10)
    document.body.dataset.modalCount = String(count + 1)
    document.body.dataset.modalOpen = 'true'
    engaged = true
  }

  const release = () => {
    if (!engaged || typeof document === 'undefined') return
    const next = Math.max(0, parseInt(document.body.dataset.modalCount || '1', 10) - 1)
    document.body.dataset.modalCount = String(next)
    if (next === 0) {
      delete document.body.dataset.modalOpen
      delete document.body.dataset.modalCount
    }
    engaged = false
  }

  watch(
    () => !!toValue(active),
    (on) => (on ? engage() : release()),
    { immediate: true },
  )

  onUnmounted(release)
}
