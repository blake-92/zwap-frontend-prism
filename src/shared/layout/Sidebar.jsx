import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Link as LinkIcon, ArrowRightLeft,
  Landmark, Users, Building2, Settings,
  ArrowRight, LogOut,
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import ZwapLogo from '@/shared/brand/ZwapLogo'
import { ROUTES } from '@/router/routes'

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard, route: ROUTES.DASHBOARD    },
  { id: 'links',         label: 'Links de Pago', icon: LinkIcon,        route: ROUTES.LINKS        },
  { id: 'transacciones', label: 'Transacciones', icon: ArrowRightLeft,  route: ROUTES.TRANSACTIONS },
  { id: 'liquidaciones', label: 'Liquidaciones', icon: Landmark,        route: ROUTES.SETTLEMENTS  },
  { id: 'usuarios',      label: 'Usuarios',      icon: Users,           route: ROUTES.USERS        },
  { id: 'sucursales',    label: 'Sucursales',    icon: Building2,       route: ROUTES.BRANCHES     },
  { id: 'configuracion', label: 'Configuración', icon: Settings,        route: ROUTES.SETTINGS     },
]

export default function Sidebar() {
  const { isDarkMode } = useTheme()
  const navigate       = useNavigate()
  const location       = useLocation()

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
        {NAV_ITEMS.map(({ id, label, icon: Icon, route }) => {
          const isActive = location.pathname === route
          return (
            <button
              key={id}
              onClick={() => navigate(route)}
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
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 space-y-3 flex-shrink-0">

        {/* Wallet shortcut */}
        <button
          onClick={() => navigate(ROUTES.WALLET)}
          className={`w-full p-5 mb-4 rounded-[24px] border transition-all duration-300 cursor-pointer overflow-hidden relative group flex justify-between items-center ${
            location.pathname === ROUTES.WALLET
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
              location.pathname === ROUTES.WALLET
                ? isDarkMode ? 'text-[#B9A4F8]' : 'text-[#7C3AED]'
                : isDarkMode ? 'text-[#888991] group-hover:text-[#D8D7D9]' : 'text-[#67656E]'
            }`}>
              Mi Billetera
            </p>
            <span className={`text-2xl font-mono font-bold tracking-tighter block leading-none ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
              $12.4K
            </span>
          </div>
          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            location.pathname === ROUTES.WALLET
              ? isDarkMode
                ? 'bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]'
                : 'bg-[#7C3AED] text-white shadow-md'
              : 'bg-transparent text-[#888991] -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
          }`}>
            <ArrowRight size={16} strokeWidth={3} />
          </div>
          {/* Glow blob */}
          <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl transition-all duration-500 pointer-events-none ${
            location.pathname === ROUTES.WALLET
              ? isDarkMode ? 'bg-[#7C3AED]/30' : 'bg-[#7C3AED]/20'
              : 'bg-transparent group-hover:bg-[#7C3AED]/15'
          }`} />
        </button>

        {/* User row */}
        <div className={`flex items-center gap-3 px-1 py-2 rounded-xl transition-all duration-300 group ${
          isDarkMode ? 'border border-transparent' : 'border border-transparent'
        }`}>
          {/* Avatar */}
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            isDarkMode
              ? 'bg-[#252429] border border-white/15 text-[#D8D7D9]'
              : 'bg-white border border-black/10 text-[#45434A] shadow-sm'
          }`}>
            A
          </div>

          {/* Name + action */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold truncate leading-tight ${isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'}`}>
              Admin Zwap
            </p>
            <p className={`text-[11px] font-medium ${isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'}`}>
              Cerrar Sesión
            </p>
          </div>

          {/* Logout icon */}
          <button
            onClick={() => { localStorage.removeItem('zwap_token'); navigate(ROUTES.LOGIN) }}
            title="Cerrar Sesión"
            className={`p-1.5 rounded-lg flex-shrink-0 transition-all duration-200 ${
              isDarkMode
                ? 'text-[#888991] hover:text-rose-400 hover:bg-rose-500/10'
                : 'text-[#67656E] hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
