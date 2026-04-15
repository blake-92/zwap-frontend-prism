import { useEffect } from 'react'
import { useIsPresent } from 'framer-motion'

/**
 * Signals to Sidebar/BottomNav that a full-attention overlay is active
 * so they apply a blur filter. Sets `data-modal-open` on body and keeps
 * a counter so stacked overlays don't prematurely clear the flag.
 *
 * The flag clears when the overlay exit animation STARTS — not on final
 * unmount — so the chrome unblurs synchronously with the backdrop fade.
 *
 * Two usage modes:
 *   1. Inside AnimatePresence (Modal, QrLightbox, ReceiptModal…): call
 *      without args. Uses `useIsPresent` — cleanup fires when the parent
 *      AnimatePresence starts unmounting this subtree.
 *
 *   2. With an external `active` flag (BottomSheet, components that
 *      self-gate their own animation via `isOpen` prop): pass the flag.
 *      Cleanup fires when the flag flips to false.
 *
 * @param {boolean} [active] Optional override. If omitted, uses isPresent.
 */
export default function useChromeBlur(active) {
  const isPresent = useIsPresent()
  const on = active ?? isPresent

  useEffect(() => {
    if (!on) return
    const count = parseInt(document.body.dataset.modalCount || '0', 10)
    document.body.dataset.modalCount = String(count + 1)
    document.body.dataset.modalOpen = 'true'
    return () => {
      const next = parseInt(document.body.dataset.modalCount || '1', 10) - 1
      document.body.dataset.modalCount = String(next)
      if (next <= 0) {
        delete document.body.dataset.modalOpen
        delete document.body.dataset.modalCount
      }
    }
  }, [on])
}
