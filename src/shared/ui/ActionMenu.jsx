import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import Button from './Button'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { ...SPRING, stiffness: 500 } },
  exit:    { opacity: 0, scale: 0.95, y: -4,  transition: { type: 'spring', stiffness: 500, damping: 30 } },
}

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: SPRING },
  exit: { y: '100%', transition: { type: 'spring', stiffness: 400, damping: 36 } },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export default function ActionMenu({ actions }) {
  const { isDarkMode } = useTheme()
  const isMobile = useMediaQuery('(max-width: 1024px)')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Prevent body scroll when sheet is open on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [isOpen, isMobile])

  // Handle outside click for desktop dropdown
  useEffect(() => {
    if (isMobile) return
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isMobile])

  const renderActions = (isSheet = false) => (
    <div className={`flex flex-col ${isSheet ? 'gap-2 px-4 pb-6' : 'gap-0.5 p-1.5'}`}>
      {actions.map((act, i) => {
        if (act.hidden) return null
        const Icon = act.icon
        return (
          <button
            key={i}
            disabled={act.disabled}
            onClick={(e) => {
              e.stopPropagation()
              if (!act.disabled) {
                act.onClick()
                setIsOpen(false)
              }
            }}
            className={`relative flex items-center ${isSheet ? 'gap-3 w-full px-5 py-4 rounded-2xl text-base' : 'gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm'} font-medium transition-colors duration-150 ${
              act.disabled
                ? isDarkMode ? 'text-[#888991]/40 cursor-not-allowed' : 'text-[#67656E]/40 cursor-not-allowed'
                : act.variant === 'danger'
                  ? isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
                  : isDarkMode ? 'text-[#D8D7D9] hover:bg-white/10' : 'text-[#111113] hover:bg-black/5'
            }`}
          >
            {Icon && <Icon size={isSheet ? 18 : 14} className={act.variant === 'danger' && !act.disabled ? '' : 'opacity-70'} />}
            {act.label}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        className={`!w-8 !h-8 ${isOpen ? (isDarkMode ? 'bg-white/10' : 'bg-black/5') : ''}`}
      >
        <MoreVertical size={16} />
      </Button>

      {/* Desktop Dropdown */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ transformOrigin: 'top right' }}
              className={`absolute top-full right-0 mt-1 min-w-[160px] rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                isDarkMode
                  ? 'bg-[#252429]/95 backdrop-blur-xl border-white/10'
                  : 'bg-white/95 backdrop-blur-xl border-gray-200'
              }`}
            >
              {renderActions()}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile Bottom Sheet (Portaled to body to escape overflow: hidden) */}
      {isMobile && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="sheet-backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
              />
              
              {/* Sheet */}
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
                  if (info.offset.y > 100 || info.velocity.y > 500) setIsOpen(false)
                }}
                className={`fixed bottom-0 inset-x-0 z-[55] rounded-t-[24px] border-t pb-[env(safe-area-inset-bottom)] ${
                  isDarkMode
                    ? 'bg-[#1A1A1D] border-white/10'
                    : 'bg-white border-black/5 shadow-[0_-8px_40px_rgba(0,0,0,0.1)]'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className={`w-10 h-1 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
                </div>
                
                <h3 className={`px-5 py-3 text-sm font-bold opacity-50 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Opciones
                </h3>

                {renderActions(true)}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
