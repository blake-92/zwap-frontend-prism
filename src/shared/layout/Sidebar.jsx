import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  LayoutDashboard, Link as LinkIcon, ArrowRightLeft,
  Landmark, Users, Building2,
  LogOut, Wallet, ArrowRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import ZwapIsotipo  from '@/shared/brand/ZwapIsotipo'
import ZwapWordmark from '@/shared/brand/ZwapWordmark'
import { ROUTES }  from '@/router/routes'
import { Avatar } from '@/shared/ui'
import { CURRENT_USER, WALLET_BALANCE } from '@/services/mocks/mockData'
import { SPRING_SIDEBAR as SPRING } from '@/shared/utils/springs'

const NAV_ITEMS = [
  { id: 'dashboard',     labelKey: 'nav.dashboard',     icon: LayoutDashboard, route: ROUTES.DASHBOARD    },
  { id: 'links',         labelKey: 'nav.links',         icon: LinkIcon,        route: ROUTES.LINKS        },
  { id: 'transacciones', labelKey: 'nav.transactions',  icon: ArrowRightLeft,  route: ROUTES.TRANSACTIONS },
  { id: 'liquidaciones', labelKey: 'nav.settlements',   icon: Landmark,        route: ROUTES.SETTLEMENTS  },
  { id: 'usuarios',      labelKey: 'nav.users',         icon: Users,           route: ROUTES.USERS        },
  { id: 'sucursales',    labelKey: 'nav.branches',      icon: Building2,       route: ROUTES.BRANCHES     },
]

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
  const { t } = useTranslation()
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
      <div className="h-20 flex items-center flex-shrink-0 overflow-hidden pl-[19px]">
        <ZwapIsotipo isDarkMode={isDarkMode} className="h-7 w-auto flex-shrink-0" />
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              key="wordmark"
              variants={LABEL_VARIANTS}
              initial="hidden"
              animate="show"
              exit="exit"
              className="overflow-hidden -ml-[2.4px]"
            >
              <ZwapWordmark isDarkMode={isDarkMode} className="h-[18px]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar">
        <LayoutGroup id="sidebar-nav">
          {NAV_ITEMS.map(({ id, labelKey, icon: Icon, route }) => {
            const isActive = location.pathname === route
            const label = t(labelKey)
            return (
              <button
                key={id}
                onClick={() => navigate(route)}
                title={isCollapsed ? label : undefined}
                className={`relative w-full h-11 flex items-center gap-3 py-3 pl-[19px] rounded-xl text-sm font-medium transition-colors duration-200 ${
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

        {/* Wallet — ícono fijo + contenido reveal */}
        <motion.button
          onClick={() => navigate(ROUTES.WALLET)}
          onHoverStart={() => setWalletHover(true)}
          onHoverEnd={() => setWalletHover(false)}
          animate={{ y: !isWalletActive && walletHover && !isCollapsed ? -3 : 0 }}
          transition={SPRING}
          title={isCollapsed ? t('nav.myWallet') : undefined}
          className={`relative w-full h-14 flex items-center pl-[19px] pr-3 py-3 mb-1 rounded-xl border overflow-hidden transition-[border-color,background-color,box-shadow] duration-200 ${
            isCollapsed
              ? 'border-transparent bg-transparent shadow-none'
              : isWalletActive
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
            className={`relative z-10 flex-shrink-0 ${
              isWalletActive ? 'text-[#7C3AED]' : isDarkMode ? 'text-[#888991]' : 'text-[#B0AFB4]'
            }`}
          />

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                key="wallet-info"
                variants={LABEL_VARIANTS}
                initial="hidden"
                animate="show"
                exit="exit"
                className="absolute inset-y-0 left-[49px] right-3 flex items-center justify-between overflow-hidden"
              >
                <div className="text-left min-w-0">
                  <p className={`text-[10px] font-bold tracking-widest uppercase leading-tight ${
                    isWalletActive
                      ? isDarkMode ? 'text-[#B9A4F8]' : 'text-[#7C3AED]'
                      : isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
                  }`}>{t('nav.myWallet')}</p>
                  <span className={`text-sm font-mono font-bold tracking-tight block leading-snug ${
                    isDarkMode ? 'text-white' : 'text-[#111113]'
                  }`}>
                    {WALLET_BALANCE.short}
                  </span>
                </div>

                <motion.div
                  animate={(isWalletActive || walletHover) ? { x: 0, opacity: 1 } : { x: -8, opacity: 0 }}
                  transition={SPRING}
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    isWalletActive
                      ? isDarkMode
                        ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                        : 'bg-[#7C3AED] text-white shadow-md'
                      : 'bg-transparent text-[#888991]'
                  }`}
                >
                  <ArrowRight size={14} strokeWidth={3} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Glow blob */}
          <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full blur-xl pointer-events-none transition-all duration-500 ${
            isCollapsed
              ? 'bg-transparent'
              : isWalletActive
                ? isDarkMode ? 'bg-[#7C3AED]/30' : 'bg-[#7C3AED]/20'
                : walletHover ? 'bg-[#7C3AED]/15' : 'bg-transparent'
          }`} />
        </motion.button>

        {/* User row */}
        <div className="relative h-[52px] flex items-center py-2 pl-[10px] rounded-xl transition-colors duration-200 overflow-hidden">
          <Avatar initials="A" size="sm" variant="neutral" />

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                key="user-info"
                variants={CONTENT_VARIANTS}
                initial="hidden"
                animate="show"
                exit="exit"
                className="absolute inset-y-0 left-[58px] right-2 flex items-center justify-between overflow-hidden"
              >
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate leading-tight ${
                    isDarkMode ? 'text-[#D8D7D9]' : 'text-[#111113]'
                  }`}>
                    {CURRENT_USER.displayName}
                  </p>
                  <p className={`text-[11px] font-medium whitespace-nowrap ${
                    isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
                  }`}>
                    {t('nav.logout')}
                  </p>
                </div>
                <button
                  onClick={() => { localStorage.removeItem('zwap_token'); navigate(ROUTES.LOGIN) }}
                  title={t('nav.logout')}
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
