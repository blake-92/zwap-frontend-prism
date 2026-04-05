import { useNavigate, useParams } from 'react-router-dom'
import {
  LayoutDashboard, Link as LinkIcon, ArrowRightLeft,
  Wallet, Users, Building2, ArrowRight, LogOut,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import ZwapLogo from '../brand/ZwapLogo'

const ICON_MAP = {
  LayoutDashboard, Link: LinkIcon, ArrowRightLeft,
  Wallet, Users, Building2,
}

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',       icon: 'LayoutDashboard' },
  { id: 'links',         label: 'Links de Pago',   icon: 'Link' },
  { id: 'transacciones', label: 'Transacciones',   icon: 'ArrowRightLeft' },
  { id: 'liquidaciones', label: 'Liquidaciones',   icon: 'Wallet' },
  { id: 'usuarios',      label: 'Usuarios',        icon: 'Users' },
  { id: 'sucursales',    label: 'Sucursales',      icon: 'Building2' },
]

export default function Sidebar({ activeTab, onTabChange }) {
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()

  return (
    <aside className={`w-64 flex-shrink-0 flex flex-col h-screen z-20 transition-colors duration-500 ${
      isDarkMode
        ? 'bg-[#111113]/20 backdrop-blur-2xl border-r border-white/10'
        : 'bg-white/40 backdrop-blur-2xl border-r border-white/80 shadow-[4px_0_30px_rgba(0,0,0,0.03)]'
    }`}>

      {/* Logo */}
      <div className="h-20 flex items-center px-6 flex-shrink-0">
        <ZwapLogo isDarkMode={isDarkMode} className="h-8" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon     = ICON_MAP[item.icon]
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive
                  ? isDarkMode
                    ? 'bg-[#252429]/40 border border-white/10 border-t-white/20 text-white shadow-xl shadow-black/30 backdrop-blur-md'
                    : 'bg-white/60 border border-white text-[#561BAF] shadow-[0_8px_20px_rgba(0,0,0,0.04)] backdrop-blur-md'
                  : isDarkMode
                    ? 'text-[#888991] hover:bg-[#252429]/30 hover:text-[#D8D7D9] border border-transparent'
                    : 'text-[#67656E] hover:bg-white/40 hover:text-[#111113] border border-transparent'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#7C3AED]' : 'opacity-70'} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 flex-shrink-0">
        {/* Wallet shortcut */}
        <div
          onClick={() => onTabChange('wallet')}
          className={`p-5 mb-4 rounded-[24px] border transition-all duration-300 cursor-pointer overflow-hidden relative group flex justify-between items-center ${
            activeTab === 'wallet'
              ? isDarkMode
                ? 'bg-[#252429]/60 border-[#7C3AED]/50 shadow-[0_0_20px_rgba(124,58,237,0.15)]'
                : 'bg-white/80 border-[#7C3AED]/40 shadow-[0_0_15px_rgba(124,58,237,0.1)]'
              : isDarkMode
                ? 'bg-[#252429]/30 border-white/10 hover:bg-[#252429]/50 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg'
                : 'bg-white/40 border-white hover:bg-white/60 hover:-translate-y-0.5 hover:shadow-md'
          }`}
        >
          <div className="relative z-10">
            <p className={`text-[11px] font-bold tracking-widest uppercase mb-1 ${
              activeTab === 'wallet'
                ? isDarkMode ? 'text-[#B9A4F8]' : 'text-[#7C3AED]'
                : isDarkMode ? 'text-[#888991] group-hover:text-[#D8D7D9]' : 'text-[#67656E]'
            }`}>
              Mi Billetera
            </p>
            <span className={`text-2xl font-mono font-bold tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
              $12.4K
            </span>
          </div>
          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            activeTab === 'wallet'
              ? isDarkMode
                ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                : 'bg-[#7C3AED] text-white shadow-md'
              : 'bg-transparent text-[#888991] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
          }`}>
            <ArrowRight size={16} strokeWidth={3} />
          </div>
          {/* Glow blob */}
          <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
            activeTab === 'wallet'
              ? isDarkMode ? 'bg-[#7C3AED]/30' : 'bg-[#7C3AED]/20'
              : 'bg-transparent group-hover:bg-[#7C3AED]/15'
          }`} />
        </div>

        {/* User / Logout */}
        <div
          className="flex items-center justify-between px-2 cursor-pointer group mt-2"
          onClick={() => navigate('/login')}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              isDarkMode
                ? 'bg-[#7C3AED]/15 text-[#7C3AED] shadow-[0_0_20px_rgba(124,58,237,0.25)] border border-[#7C3AED]/40'
                : 'bg-[#DBD3FB]/60 border border-white text-[#561BAF] shadow-sm'
            }`}>
              A
            </div>
            <div className="flex flex-col text-left">
              <span className={`text-sm font-semibold leading-tight transition-colors ${
                isDarkMode ? 'text-[#D8D7D9] group-hover:text-white' : 'text-[#111113] group-hover:text-[#7C3AED]'
              }`}>
                Admin Zwap
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
                Cerrar Sesión
              </span>
            </div>
          </div>
          <LogOut size={16} className={`transition-colors ${
            isDarkMode ? 'text-[#888991] group-hover:text-rose-400' : 'text-[#67656E] group-hover:text-rose-500'
          }`} />
        </div>
      </div>
    </aside>
  )
}
