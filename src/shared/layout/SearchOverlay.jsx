import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

/**
 * SearchPanel — dropdown panel that appears below the header.
 * Renders a search input + results area in a floating card.
 * Click outside or ESC to close.
 */
export default function SearchPanel({ onClose }) {
  const { isDarkMode } = useTheme()
  const inputRef = useRef(null)
  const panelRef = useRef(null)

  // Autofocus on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [])

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    // Use setTimeout to avoid the opening click triggering close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler)
    }, 10)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [onClose])

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{
        opacity: { duration: 0.12 },
        y: SPRING,
        scale: SPRING,
      }}
      style={{ transformOrigin: 'top center' }}
      className={`fixed top-[calc(4rem+0.5rem)] lg:top-[calc(5rem+0.5rem)] left-3 right-3 sm:left-4 sm:right-4 z-50 rounded-2xl border shadow-2xl overflow-hidden ${
        isDarkMode
          ? 'bg-[#252429]/95 backdrop-blur-3xl border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.7)]'
          : 'bg-white/95 backdrop-blur-3xl border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.12)]'
      }`}
    >
      {/* Search input */}
      <div className={`flex items-center gap-3 px-4 py-3.5 ${
        isDarkMode ? 'border-b border-white/10' : 'border-b border-black/5'
      }`}>
        <Search size={18} className={isDarkMode ? 'text-[#7C3AED]' : 'text-[#7C3AED]'} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar transacciones, links o clientes..."
          className={`flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:opacity-50 ${
            isDarkMode ? 'text-[#D8D7D9] placeholder:text-[#888991]' : 'text-[#111113] placeholder:text-[#B0AFB4]'
          }`}
        />
        <motion.button
          onClick={onClose}
          whileTap={{ scale: 0.9 }}
          transition={SPRING}
          className={`p-3 -mr-1.5 rounded-xl transition-colors ${
            isDarkMode ? 'text-[#888991] hover:bg-white/10' : 'text-[#67656E] hover:bg-black/5'
          }`}
        >
          <X size={18} />
        </motion.button>
      </div>

      {/* Results area / empty state */}
      <div className="px-4 py-6">
        <p className={`text-xs font-medium text-center ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
          Escribe para buscar en transacciones, links de pago y clientes.
        </p>
      </div>
    </motion.div>
  )
}
