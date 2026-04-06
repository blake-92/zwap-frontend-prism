import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import { ROUTES } from '@/router/routes'

export default function WalletSidebarCard() {
  const { isDarkMode } = useTheme()
  const navigate        = useNavigate()
  const location        = useLocation()

  const isActive = location.pathname === ROUTES.WALLET

  return (
    <button
      onClick={() => navigate(ROUTES.WALLET)}
      className={`w-full p-5 mb-4 rounded-[24px] border transition-all duration-300 cursor-pointer overflow-hidden relative group flex justify-between items-center ${
        isActive
          ? isDarkMode
            ? 'bg-[#252429]/60 border-[#7C3AED]/50 shadow-[0_0_20px_rgba(124,58,237,0.15)]'
            : 'bg-white/80 border-[#7C3AED]/40 shadow-[0_0_15px_rgba(124,58,237,0.1)]'
          : isDarkMode
            ? 'bg-[#252429]/30 border-white/10 hover:bg-[#252429]/50 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg'
            : 'bg-white/40 border-white hover:bg-white/60 hover:-translate-y-0.5 hover:shadow-md'
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

      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
        isActive
          ? isDarkMode
            ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
            : 'bg-[#7C3AED] text-white shadow-md'
          : 'bg-transparent text-[#888991] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
      }`}>
        <ArrowRight size={16} strokeWidth={3} />
      </div>

      {/* Glow blob */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
        isActive
          ? isDarkMode ? 'bg-[#7C3AED]/30' : 'bg-[#7C3AED]/20'
          : 'bg-transparent group-hover:bg-[#7C3AED]/15'
      }`} />
    </button>
  )
}
