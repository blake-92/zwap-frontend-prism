import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Filter } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import useMediaQuery from '@/shared/hooks/useMediaQuery'
import Button from './Button'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

const panelVariants = {
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

export default function DropdownFilter({ label, options, value, onChange, icon: Icon }) {
  const { isDarkMode } = useTheme()
  const isMobile = useMediaQuery('(max-width: 1024px)')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const pillId = useId()

  const DisplayIcon = Icon || Filter

  useEffect(() => {
    if (!isMobile || !isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [isOpen, isMobile])

  useEffect(() => {
    if (isMobile) return
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isMobile])

  const renderOptions = (isSheet = false) => (
    <div className={isSheet ? "px-4 pb-6 flex flex-col gap-2" : "p-1.5 flex flex-col gap-0.5"}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => { onChange(opt); setIsOpen(false) }}
          className={`relative flex items-center justify-between w-full ${isSheet ? 'px-5 py-4 rounded-2xl text-base' : 'px-3 py-2 rounded-xl text-sm'} font-medium transition-colors duration-150 ${
            value === opt
              ? isDarkMode ? 'text-white' : 'text-[#561BAF]'
              : isDarkMode ? 'text-[#888991] hover:text-[#D8D7D9]' : 'text-[#67656E] hover:text-[#111113]'
          }`}
        >
          {value === opt && (
            <motion.div
              layoutId={`dropdown-pill-${pillId}`}
              className={`absolute inset-0 ${isSheet ? 'rounded-2xl' : 'rounded-xl'} ${
                isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#DBD3FB]/50'
              }`}
              transition={SPRING}
            />
          )}
          <span className="relative z-10">{opt}</span>
          {value === opt && (
            <Check size={isSheet ? 18 : 14} className={`relative z-10 ${isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'}`} />
          )}
        </button>
      ))}
    </div>
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size={isMobile ? 'icon' : 'sm'}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`transition-all ${isMobile ? '!w-10 !h-10 !p-0 flex items-center justify-center' : '!px-3 flex items-center gap-1.5'} ${
          isOpen
            ? isDarkMode
              ? 'bg-[#111113]/80 border-[#7C3AED]/50 text-white shadow-[0_0_15px_rgba(124,58,237,0.15)]'
              : 'bg-white border-[#7C3AED]/40 text-[#111113]'
            : ''
        }`}
      >
        <DisplayIcon size={isMobile ? 18 : 14} className={value !== 'Todos' && value !== 'Cualquier fecha' && value !== '' ? 'text-[#7C3AED]' : 'opacity-70'} />
        {!isMobile && (
          <>
            <span className="font-semibold">
              {label}{value && value !== 'Todos' && value !== 'Cualquier fecha' ? `: ${value}` : ''}
            </span>
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={SPRING}
              className="opacity-70 flex items-center"
            >
              <ChevronDown size={14} />
            </motion.span>
          </>
        )}
      </Button>

      {/* Desktop Dropdown */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ transformOrigin: 'top left' }}
              className={`absolute top-full left-0 mt-2 min-w-[180px] rounded-2xl border shadow-2xl z-50 overflow-hidden ${
                isDarkMode
                  ? 'bg-[#252429]/95 backdrop-blur-xl border-white/10'
                  : 'bg-white/95 backdrop-blur-xl border-gray-200'
              }`}
            >
              {renderOptions()}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Mobile Bottom Sheet */}
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
                onClick={() => setIsOpen(false)}
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
              >
                <div className="flex justify-center pt-3 pb-2">
                  <div className={`w-10 h-1 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
                </div>
                
                <h3 className={`px-5 py-3 text-sm font-bold opacity-50 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Filtrar por {label.toLowerCase()}
                </h3>

                {renderOptions(true)}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
