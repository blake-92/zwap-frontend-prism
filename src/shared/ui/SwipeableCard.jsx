import { useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { getCardClasses } from '@/shared/utils/cardClasses'

export default function SwipeableCard({ children, actions, className = '' }) {
  const { isDarkMode } = useTheme()
  const controls = useAnimation()
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const validActions = actions.filter(a => !a.hidden)
  const actionWidth = 76
  const maxDrag = validActions.length * actionWidth

  const handleDragEnd = (event, info) => {
    const threshold = -maxDrag / 2
    if (info.offset.x < threshold || info.velocity.x < -500) {
      controls.start({ x: -maxDrag })
      setIsOpen(true)
    } else {
      controls.start({ x: 0 })
      setIsOpen(false)
    }
  }

  const closeCard = () => {
    controls.start({ x: 0 })
    setIsOpen(false)
  }

  const { base } = getCardClasses(isDarkMode)

  return (
    <div className={`relative overflow-hidden rounded-[24px] ${className}`}>
      {/* Background actions layer — hidden until drag/open to prevent flash on mount animation */}
      <div
        className={`absolute inset-y-0 right-0 flex justify-end overflow-hidden transition-opacity duration-150 ${
          isOpen || isDragging ? 'opacity-100' : 'opacity-0'
        } ${
          isDarkMode ? 'bg-[#111113]/50 border border-white/5' : 'bg-gray-100 border border-black/5'
        } rounded-[24px]`}
        style={{ width: maxDrag }}
      >
        {validActions.map((act) => {
           const Icon = act.icon
           return (
             <button
               key={act.label}
               aria-label={act.label}
               onClick={(e) => {
                 e.stopPropagation()
                 if (!act.disabled) {
                   act.onClick()
                   closeCard()
                 }
               }}
               disabled={act.disabled}
               style={{ width: actionWidth }}
               className={`flex flex-col items-center justify-center gap-1.5 h-full text-[10px] font-bold transition-colors ${
                 act.disabled 
                   ? isDarkMode ? 'text-[#888991]/40 cursor-not-allowed' : 'text-[#67656E]/40 cursor-not-allowed'
                   : act.variant === 'danger' 
                     ? isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
                     : isDarkMode ? 'text-[#A78BFA] hover:bg-white/5' : 'text-[#561BAF] hover:bg-[#7C3AED]/10'
               }`}
             >
               {Icon && <Icon size={18} className={act.variant === 'danger' && !act.disabled ? '' : 'opacity-80'} />}
               <span className={act.variant === 'danger' && !act.disabled ? '' : 'opacity-90'}>{act.label}</span>
             </button>
           )
        })}
      </div>
      
      {/* Foreground card */}
      <motion.div
        drag={maxDrag > 0 ? "x" : false}
        dragConstraints={{ left: -maxDrag, right: 0 }}
        dragElastic={0.1}
        animate={controls}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(...args) => { setIsDragging(false); handleDragEnd(...args) }}
        onClick={() => {
          if (isOpen) closeCard()
        }}
        className={`relative z-10 w-full rounded-[24px] border overflow-hidden ${base}`}
      >
        {children}
        
        {/* Visual indicator (animated chevron) - only show if actions exist and not open */}
        {maxDrag > 0 && !isOpen && (
          <motion.div
            initial={{ x: 5 }}
            animate={{ x: 0 }}
            transition={{
              type: 'spring',
              stiffness: 120,
              damping: 8,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className={`absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center w-10 pointer-events-none rounded-r-[24px] ${
              isDarkMode 
                ? 'bg-gradient-to-l from-[#252429] via-[#252429]/80 to-transparent text-white/40' 
                : 'bg-gradient-to-l from-white via-white/80 to-transparent text-black/30'
            }`}
          >
            <ChevronLeft size={16} strokeWidth={3} className="ml-2" />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
