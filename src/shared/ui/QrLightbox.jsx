import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode } from 'lucide-react'
import useScrollLock from '@/shared/hooks/useScrollLock'
import useChromeBlur from '@/shared/hooks/useChromeBlur'

/**
 * QrLightbox — Prism UI
 *
 * Lightbox fullscreen para QR. Abre vía layoutId morph desde una
 * miniatura (misma prop `layoutId` compartida). Se portaliza al body
 * para escapar stacking contexts y setea data-modal-open para que
 * sidebar/bottomnav se difuminen junto al backdrop.
 *
 * Props:
 *   isOpen    boolean  — controla visibilidad
 *   onClose   fn       — handler de cierre (backdrop + ESC)
 *   layoutId  string   — layoutId único que match con la miniatura
 *   name      string   — nombre del link mostrado bajo el QR
 *   url       string   — URL mostrada en mono-font bajo el nombre
 *   qrSize    number?  — tamaño del QR (default 280)
 */
export default function QrLightbox({ isOpen, onClose, layoutId, name, url, qrSize = 280 }) {
  useScrollLock(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <LightboxContent onClose={onClose} layoutId={layoutId} name={name} url={url} qrSize={qrSize} />
      )}
    </AnimatePresence>,
    document.body
  )
}

function LightboxContent({ onClose, layoutId, name, url, qrSize }) {
  useChromeBlur()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        layoutId={layoutId}
        className="relative bg-white p-8 sm:p-12 rounded-[32px] shadow-2xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <QrCode size={qrSize} className="text-black mb-6" strokeWidth={1.5} />
        <p className="text-[#111113] font-bold text-xl mb-1 text-center">{name}</p>
        <p className="text-[#67656E] font-mono text-sm text-center">{url}</p>
      </motion.div>
    </div>
  )
}
