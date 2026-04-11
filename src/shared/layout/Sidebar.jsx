import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  LayoutDashboard, Link as LinkIcon, ArrowRightLeft,
  Landmark, Users, Building2,
  LogOut, Wallet,
} from 'lucide-react'
import { useTheme } from '@/shared/context/ThemeContext'
import ZwapLogo    from '@/shared/brand/ZwapLogo'
import ZwapIsotipo from '@/shared/brand/ZwapIsotipo'
import { ROUTES }  from '@/router/routes'
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

const SPRING = { type: 'spring', stiffness: 380, damping: 42 }

// Liquid label reveal: blur + slide spring con delay para esperar al sidebar
const LABEL_VARIANTS = {
  hidden: { opacity: 0, filter: 'blur(4px)', x: -8 },
  show:   { opacity: 1, filter: 'blur(0px)', x: 0,
            transition: { type: 'spring', stiffness: 400, damping: 30, delay: 0.06 } },
  exit:   { opacity: 0, filter: 'blur(4px)', x: -8,
            transition: { type: 'spring', stiffness: 320, damping: 28 } },
}

// Fade-blur para contenido secundario (user info, logout)
const CONTENT_VARIANTS = {
  hidden: { opacity: 0, filter: 'blur(3px)' },
  show:   { opacity: 1, filter: 'blur(0px)',
            transition: { type: 'spring', stiffness: 380, damping: 30, delay: 0.1 } },
  exit:   { opacity: 0, filter: 'blur(3px)',
            transition: { type: 'spring', stiffness: 320, damping: 28 } },
}

export default function Sidebar({ isCollapsed }) {
  const { isDarkMode } = useTheme()
  const navigate       = useNavigate()
  const location       = useLocation()

  const isWalletActive    = location.pathname === ROUTES.WALLET
  const [walletHover, setWalletHover] = useState(false)

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={SPRING}
      className={`relative flex-shrink-0 flex flex-col h-screen z-20 overflow-hidden transition-colors duration-500 ${
        isDarkMode
          ? 'bg-[#111113]/20 backdrop-blur-2xl border-r border-white/10'
          : 'bg-white/40 backdrop-blur-2xl border-r border-white/80 shadow-[4px_0_30px_rgba(0,0,0,0.03)]'
      }`}
    >

      {/* ── Logo ── */}
      <div className={`h-20 flex items-center flex-shrink-0 overflow-hidden ${
        isCollapsed ? 'justify-center px-0' : 'px-4'
      }`}>
        <AnimatePresence mode="wait" initial={false}>
          {isCollapsed ? (
            <motion.div
              key="iso"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ZwapIsotipo isDarkMode={isDarkMode} className="h-7 w-auto" />
            </motion.div>
          ) : (
            <motion.div
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ZwapLogo isDarkMode={isDarkMode} className="h-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar">
        <LayoutGroup id="sidebar-nav">
          {NAV_ITEMS.map(({ id, label, icon: Icon, route }) => {
            const isActive = location.pathname === route
            return (
              <button
                key={id}
                onClick={() => navigate(route)}
                title={isCollapsed ? label : undefined}
                className={`relative w-full flex items-center gap-3 py-3 pl-[19px] rounded-xl text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? isDarkMode ? 'text-white'     : 'text-[#561BAF]'
                    : isDarkMode ? 'text-[#888991] hover:text-[#D8D7D9]'
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
                    transition={SPRING}
                  />
                )}
                <Icon
                  size={18}
                  className={`relative z-10 flex-shrink-0 ${isActive ? 'text-[#7C3AED]' : 'opacity-70'}`}
                />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      key="label"
                      variants={LABEL_VARIANTS}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="relative z-10 whitespace-nowrap overflow-hidden"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </LayoutGroup>
      </nav>

      {/* ── Footer ── */}
      <div className="px-2 pb-5 space-y-3 flex-shrink-0">

        {/* Wallet — card completa o ícono según estado */}
        <AnimatePresence mode="wait" initial={false}>
          {isCollapsed ? (
            <motion.button
              key="wallet-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: !isWalletActive && walletHover ? -3 : 0 }}
              exit={{ opacity: 0 }}
              transition={SPRING}
              onClick={() => navigate(ROUTES.WALLET)}
              onHoverStart={() => setWalletHover(true)}
              onHoverEnd={() => setWalletHover(false)}
              title="Mi Billetera"
              className={`relative w-full flex items-center justify-center py-3 mb-1 rounded-xl border overflow-hidden transition-all duration-200 ${
                isWalletActive
                  ? isDarkMode
                    ? 'bg-[#252429]/60 border-[#7C3AED]/50 shadow-[0_0_16px_rgba(124,58,237,0.2)]'
                    : 'bg-white/80 border-[#7C3AED]/40 shadow-[0_0_12px_rgba(124,58,237,0.15)]'
                  : isDarkMode
                    ? 'bg-[#252429]/20 border-white/10 hover:bg-[#252429]/40 hover:border-[#7C3AED]/30'
                    : 'bg-white/40 border-white hover:bg-white/60 hover:border-[#7C3AED]/20'
              }`}
            >
              <Wallet
                size={18}
                className={`relative z-10 ${isWalletActive ? 'text-[#7C3AED]' : isDarkMode ? 'text-[#888991]' : 'text-[#B0AFB4]'}`}
              />
              <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-xl pointer-events-none transition-all duration-500 ${
                isWalletActive
                  ? isDarkMode ? 'bg-[#7C3AED]/30' : 'bg-[#7C3AED]/20'
                  : walletHover ? 'bg-[#7C3AED]/15' : 'bg-transparent'
              }`} />
            </motion.button>
          ) : (
            <motion.div
              key="wallet-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <WalletSidebarCard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* User row */}
        <div className="flex items-center gap-3 py-2 pl-[10px] rounded-xl transition-colors duration-200">
          <Avatar initials="A" size="sm" variant="neutral" />

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                key="user-info"
                variants={CONTENT_VARIANTS}
                initial="hidden"
                animate="show"
                exit="exit"
                className="flex-1 min-w-0 flex items-center justify-between overflow-hidden"
              >
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate leading-tight ${
                    isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'
                  }`}>
                    Admin Zwap
                  </p>
                  <p className={`text-[11px] font-medium ${
                    isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
                  }`}>
                    Cerrar Sesión
                  </p>
                </div>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
