import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'

export default function Tooltip({ children, content, position = 'top' }) {
  const { isDarkMode } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef(null)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), 300) // Delay before showing
  }

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap pointer-events-none shadow-xl ${positionClasses[position]} ${
              isDarkMode
                ? 'bg-[#252429]/90 backdrop-blur-md border border-white/10 text-white'
                : 'bg-white/90 backdrop-blur-md border border-[#7C3AED]/20 text-[#111113]'
            }`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
