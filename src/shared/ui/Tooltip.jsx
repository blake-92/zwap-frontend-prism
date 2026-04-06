import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/shared/context/ThemeContext'

export default function Tooltip({ children, content, position = 'top' }) {
  const { isDarkMode } = useTheme()
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: -9999, left: -9999 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    
    // Default: top
    let top = rect.top - tooltipRect.height - 8
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2)

    if (position === 'bottom') {
      top = rect.bottom + 8
    } else if (position === 'left') {
      top = rect.top + (rect.height / 2) - (tooltipRect.height / 2)
      left = rect.left - tooltipRect.width - 8
    } else if (position === 'right') {
      top = rect.top + (rect.height / 2) - (tooltipRect.height / 2)
      left = rect.right + 8
    }

    setCoords({ top, left })
  }

  const showTooltip = () => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, 300)
  }

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current)
    setIsVisible(false)
    setCoords({ top: -9999, left: -9999 })
  }

  useLayoutEffect(() => {
    if (isVisible) {
      updatePosition()
      
      const handleScrollOrResize = () => hideTooltip()

      window.addEventListener('resize', handleScrollOrResize)
      window.addEventListener('scroll', handleScrollOrResize, true)
      
      return () => {
        window.removeEventListener('resize', handleScrollOrResize)
        window.removeEventListener('scroll', handleScrollOrResize, true)
      }
    }
  }, [isVisible, position])

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-flex items-center justify-center"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                pointerEvents: 'none',
                zIndex: 99999,
                visibility: coords.top === -9999 ? 'hidden' : 'visible'
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-xl ${
                isDarkMode
                  ? 'bg-[#252429]/90 backdrop-blur-md border border-white/10 text-white'
                  : 'bg-white/90 backdrop-blur-md border border-[#7C3AED]/20 text-[#111113]'
              }`}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
