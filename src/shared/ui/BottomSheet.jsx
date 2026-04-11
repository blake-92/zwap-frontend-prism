import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'

/**
 * BottomSheet — Prism UI
 *
 * Primitivo mobile: panel deslizante desde el borde inferior con backdrop,
 * handle bar, drag-to-dismiss y safe-area. Se portaliza al body para escapar
 * overflow:hidden de contenedores padres.
 *
 * Solo debe usarse bajo lg (<1024px). Los consumidores condicionan su render
 * mediante useMediaQuery y reservan el panel desktop por su cuenta.
 *
 * Props:
 *   isOpen    boolean  — controla visibilidad (trigger de AnimatePresence)
 *   onClose   fn       — handler de cierre (backdrop + drag-dismiss)
 *   title     string?  — título opcional renderizado sobre el contenido
 *   children  node     — contenido del sheet
 */
const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

const sheetVariants = {
  hidden:  { y: '100%' },
  visible: { y: 0, transition: SPRING },
  exit:    { y: '100%', transition: { type: 'spring', stiffness: 400, damping: 36 } },
}

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

export default function BottomSheet({ isOpen, onClose, title, children }) {
  const { isDarkMode } = useTheme()

  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [isOpen])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="sheet-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="sheet-panel"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) onClose()
            }}
            className={`fixed bottom-0 inset-x-0 z-[55] rounded-t-[24px] border-t pb-[env(safe-area-inset-bottom)] ${
              isDarkMode
                ? 'bg-[#1A1A1D] border-white/10'
                : 'bg-white border-black/5 shadow-[0_-8px_40px_rgba(0,0,0,0.1)]'
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className={`w-10 h-1 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
            </div>

            {title && (
              <h3 className={`px-5 py-3 text-sm font-bold opacity-50 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {title}
              </h3>
            )}

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
