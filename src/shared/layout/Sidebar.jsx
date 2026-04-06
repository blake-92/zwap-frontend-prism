import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Link as LinkIcon, ArrowRightLeft,
  Landmark, Users, Building2, Settings,
  LogOut,
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import ZwapLogo from '@/shared/brand/ZwapLogo'
import { ROUTES } from '@/router/routes'
import WalletSidebarCard from '@/features/wallet/components/WalletSidebarCard'

const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard, route: ROUTES.DASHBOARD    },
  { id: 'links',         label: 'Links de Pago', icon: LinkIcon,        route: ROUTES.LINKS        },
  { id: 'transacciones', label: 'Transacciones', icon: ArrowRightLeft,  route: ROUTES.TRANSACTIONS },
  { id: 'liquidaciones', label: 'Liquidaciones', icon: Landmark,        route: ROUTES.SETTLEMENTS  },
  { id: 'usuarios',      label: 'Usuarios',      icon: Users,           route: ROUTES.USERS        },
  { id: 'sucursales',    label: 'Sucursales',    icon: Building2,       route: ROUTES.BRANCHES     },
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
        <WalletSidebarCard />

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
