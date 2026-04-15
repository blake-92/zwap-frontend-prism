import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Tracks whether any modal is currently open (data-modal-open on body).
 * Used to blur/dim chrome that lives outside the modal backdrop stacking.
 */
export function useModalOpen() {
  const isOpen = ref(false)
  let observer = null

  onMounted(() => {
    if (typeof document === 'undefined') return
    const check = () => { isOpen.value = document.body.dataset.modalOpen === 'true' }
    check()
    observer = new MutationObserver(check)
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-modal-open'] })
  })

  onUnmounted(() => observer?.disconnect())

  return isOpen
}
