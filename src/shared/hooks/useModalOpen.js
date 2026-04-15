import { useState, useEffect } from 'react'

/**
 * Tracks whether any modal is currently open by observing
 * the data-modal-open attribute set by the Modal component.
 * Used to blur/dim chrome elements (Sidebar, BottomNav) that
 * sit outside the modal's backdrop stacking context.
 */
export default function useModalOpen() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsOpen(document.body.dataset.modalOpen === 'true')
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-modal-open'] })
    return () => observer.disconnect()
  }, [])

  return isOpen
}
