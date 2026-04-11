import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import Button from './Button'

/**
 * Modal — Prism UI
 *
 * Wrapper glass estándar para modales de formulario.
 * Los modales de recibo (ReceiptModal, WithdrawReceiptModal) usan AnimatePresence
 * y diseño especializado — no usan este componente.
 *
 * Props:
 *   onClose       fn        — handler de cierre (backdrop + X button + Escape key)
 *   title         string    — título del header (h2)
 *   description   node?     — subtítulo del header (puede ser JSX)
 *   icon          node?     — ícono junto al título (e.g. <ArrowUpFromLine />)
 *   maxWidth      string?   — ancho máximo del modal (default '480px')
 *   footer        node?     — contenido del footer (wrapped en barra con borde y fondo)
 *   className     string?   — clases extra en el contenedor interno (e.g. 'max-h-[90vh] flex flex-col')
 *   children      node      — cuerpo del modal
 */
export default function Modal({
  onClose,
  title,
  description,
  icon,
  maxWidth = '480px',
  footer,
  className = '',
  children,
}) {
  const { isDarkMode } = useTheme()
  const isMobile = !useMediaQuery('(min-width: 640px)')
  const containerRef = useRef(null)

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [])

  // Focus trap: keep focus within modal (re-queries on each Tab press)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const getFocusable = () =>
      el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')

    const initial = getFocusable()
    if (initial.length > 0) initial[0].focus()

    const handleTab = (e) => {
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [])

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className={`absolute inset-0 backdrop-blur-md backdrop-saturate-200 ${
          isDarkMode ? 'bg-black/70' : 'bg-[#111113]/40'
        }`}
        onClick={onClose}
      />

      {/* Container */}
      <motion.div
        ref={containerRef}
        {...(isMobile && {
          drag: 'y',
          dragConstraints: { top: 0 },
          dragElastic: 0.2,
          onDragEnd: (e, info) => {
            if (info.offset.y > 100 || info.velocity.y > 500) onClose()
          },
        })}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{
          opacity: { duration: 0.15 },
          scale: { type: 'spring', stiffness: 400, damping: 30 },
          y: { type: 'spring', stiffness: 400, damping: 30 },
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{ maxWidth }}
        className={`relative w-full rounded-t-[24px] sm:rounded-[24px] border overflow-hidden shadow-2xl max-h-[95vh] sm:max-h-[90vh] pb-[env(safe-area-inset-bottom)] sm:pb-0 ${
          isDarkMode
            ? 'bg-[#252429]/80 backdrop-blur-3xl border-white/20 border-t-white/30'
            : 'bg-white/90 backdrop-blur-3xl border-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
        } ${className}`}
      >
        {/* Handle bar mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className={`w-10 h-1 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
        </div>

        {/* Header */}
        <div className={`px-5 sm:px-8 py-4 sm:py-6 border-b flex justify-between items-start flex-shrink-0 ${
          isDarkMode ? 'border-white/10' : 'border-black/5'
        }`}>
          <div>
            <h2 id="modal-title" className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-[#111113]'
            }`}>
              {icon && <span className="text-[#7C3AED]">{icon}</span>}
              {title}
            </h2>
            {description && (
              <p className={`text-sm mt-1 font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="!w-11 !h-11 sm:!w-10 sm:!h-10">
            <X size={20} />
          </Button>
        </div>

        {/* Body */}
        {children}

        {/* Footer */}
        {footer && (
          <div className={`px-5 sm:px-8 py-5 sm:py-6 flex gap-3 sm:gap-4 border-t flex-shrink-0 ${
            isDarkMode ? 'bg-[#111113]/40 border-white/10' : 'bg-gray-50/50 border-black/5'
          }`}>
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
