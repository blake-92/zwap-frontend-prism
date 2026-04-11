import { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import Button from './Button'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { ...SPRING, stiffness: 500 } },
  exit:    { opacity: 0, scale: 0.95, y: -4,  transition: { type: 'spring', stiffness: 500, damping: 30 } },
}

export default function DropdownFilter({ label, options, value, onChange, icon: Icon }) {
  const { isDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const pillId = useId()

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
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`!px-3 flex items-center gap-1.5 transition-all ${
          isOpen
            ? isDarkMode
              ? 'bg-[#111113]/80 border-[#7C3AED]/50 text-white shadow-[0_0_15px_rgba(124,58,237,0.15)]'
              : 'bg-white border-[#7C3AED]/40 text-[#111113]'
            : ''
        }`}
      >
        {Icon && <Icon size={14} className={value !== 'Todos' && value !== '' ? 'text-[#7C3AED]' : 'opacity-70'} />}
        <span className="font-semibold">
          {label}{value && value !== 'Todos' ? `: ${value}` : ''}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={SPRING}
          className="opacity-70 flex items-center"
        >
          <ChevronDown size={14} />
        </motion.span>
      </Button>

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
            <div className="p-1.5 flex flex-col gap-0.5">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false) }}
                  className={`relative flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    value === opt
                      ? isDarkMode ? 'text-white' : 'text-[#561BAF]'
                      : isDarkMode ? 'text-[#888991] hover:text-[#D8D7D9]' : 'text-[#67656E] hover:text-[#111113]'
                  }`}
                >
                  {value === opt && (
                    <motion.div
                      layoutId={`dropdown-pill-${pillId}`}
                      className={`absolute inset-0 rounded-xl ${
                        isDarkMode ? 'bg-[#7C3AED]/15' : 'bg-[#DBD3FB]/50'
                      }`}
                      transition={SPRING}
                    />
                  )}
                  <span className="relative z-10">{opt}</span>
                  {value === opt && (
                    <Check size={14} className={`relative z-10 ${isDarkMode ? 'text-[#7C3AED]' : 'text-[#561BAF]'}`} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
