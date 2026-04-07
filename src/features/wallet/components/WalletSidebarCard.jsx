import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { ROUTES } from '@/router/routes'

const SPRING = { type: 'spring', stiffness: 400, damping: 25 }

export default function WalletSidebarCard() {
  const { isDarkMode } = useTheme()
  const navigate        = useNavigate()
  const location        = useLocation()
  const [hovered, setHovered] = useState(false)

  const isActive = location.pathname === ROUTES.WALLET
  const showArrow = isActive || hovered

  return (
    <motion.button
      onClick={() => navigate(ROUTES.WALLET)}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ y: !isActive && hovered ? -3 : 0 }}
      transition={SPRING}
      className={`w-full p-5 mb-4 rounded-[24px] border cursor-pointer overflow-hidden relative group flex justify-between items-center ${
        isActive
          ? isDarkMode
            ? 'bg-[#252429]/60 border-[#7C3AED]/50 shadow-[0_0_20px_rgba(124,58,237,0.15)]'
            : 'bg-white/80 border-[#7C3AED]/40 shadow-[0_0_15px_rgba(124,58,237,0.1)]'
          : isDarkMode
            ? 'bg-[#252429]/30 border-white/10 hover:bg-[#252429]/50 hover:border-white/20 hover:shadow-lg'
            : 'bg-white/40 border-white hover:bg-white/60 hover:shadow-md'
      }`}
    >
      <div className="relative z-10 text-left">
        <p className={`text-[11px] font-bold tracking-widest uppercase mb-1 transition-colors ${
          isActive
            ? isDarkMode ? 'text-[#B9A4F8]' : 'text-[#7C3AED]'
            : isDarkMode ? 'text-[#888991] group-hover:text-[#D8D7D9]' : 'text-[#67656E]'
        }`}>
          Mi Billetera
        </p>
        <span className={`text-2xl font-mono font-bold tracking-tighter block leading-none ${
          isDarkMode ? 'text-white' : 'text-[#111113]'
        }`}>
          $12.4K
        </span>
      </div>

      <motion.div
        animate={showArrow ? { x: 0, opacity: 1 } : { x: -8, opacity: 0 }}
        transition={SPRING}
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
          isActive
            ? isDarkMode
              ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
              : 'bg-[#7C3AED] text-white shadow-md'
            : 'bg-transparent text-[#888991]'
        }`}
      >
        <ArrowRight size={16} strokeWidth={3} />
      </motion.div>

      {/* Glow blob */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
        isActive
          ? isDarkMode ? 'bg-[#7C3AED]/30' : 'bg-[#7C3AED]/20'
          : 'bg-transparent group-hover:bg-[#7C3AED]/15'
      }`} />
    </motion.button>
  )
}
