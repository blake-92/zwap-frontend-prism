import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Link as LinkIcon, ArrowRightLeft,
  Landmark, Users, Building2,
  LogOut,
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import ZwapLogo from '@/shared/brand/ZwapLogo'
import { ROUTES } from '@/router/routes'
import WalletSidebarCard from '@/features/wallet/components/WalletSidebarCard'
import Avatar from '@/shared/ui/Avatar'

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
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? isDarkMode ? 'text-white' : 'text-[#561BAF]'
                  : isDarkMode
                    ? 'text-[#888991] hover:text-[#D8D7D9]'
                    : 'text-[#67656E] hover:text-[#111113]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className={`absolute inset-0 rounded-xl ${
                    isDarkMode
                      ? 'bg-[#252429]/40 border border-white/10 border-t-white/20 shadow-xl shadow-black/30 backdrop-blur-md'
                      : 'bg-white/60 border border-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] backdrop-blur-md'
                  }`}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} className={`relative z-10 ${isActive ? 'text-[#7C3AED]' : 'opacity-70'}`} />
              <span className="relative z-10">{label}</span>
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
          <Avatar initials="A" size="sm" variant="neutral" />

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
