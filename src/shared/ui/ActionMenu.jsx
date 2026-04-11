import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import Button from './Button'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { ...SPRING, stiffness: 500 } },
  exit:    { opacity: 0, scale: 0.95, y: -4,  transition: { type: 'spring', stiffness: 500, damping: 30 } },
}

export default function ActionMenu({ actions }) {
  const { isDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={panelVariants}
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
            <div className="p-1.5 flex flex-col gap-0.5">
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
                    className={`relative flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                      act.disabled
                        ? isDarkMode ? 'text-[#888991]/40 cursor-not-allowed' : 'text-[#67656E]/40 cursor-not-allowed'
                        : act.variant === 'danger'
                          ? isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
                          : isDarkMode ? 'text-[#D8D7D9] hover:bg-white/10' : 'text-[#111113] hover:bg-black/5'
                    }`}
                  >
                    {Icon && <Icon size={14} className={act.variant === 'danger' && !act.disabled ? '' : 'opacity-70'} />}
                    {act.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
