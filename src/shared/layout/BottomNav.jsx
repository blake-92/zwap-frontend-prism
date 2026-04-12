import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  LayoutDashboard, ArrowRightLeft, Link as LinkIcon, Landmark,
  MoreHorizontal, X, Building2, Users, Wallet, Settings,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/shared/context/ThemeContext'
import { ROUTES } from '@/router/routes'

const SPRING = { type: 'spring', stiffness: 400, damping: 30 }

const TABS = [
  { id: 'dashboard',     labelKey: 'nav.dashboard',     icon: LayoutDashboard, route: ROUTES.DASHBOARD    },
  { id: 'transacciones', labelKey: 'nav.transactions',  icon: ArrowRightLeft,  route: ROUTES.TRANSACTIONS },
  { id: 'links',         labelKey: 'nav.linksShort',    icon: LinkIcon,        route: ROUTES.LINKS        },
  { id: 'liquidaciones', labelKey: 'nav.settlements',   icon: Landmark,        route: ROUTES.SETTLEMENTS  },
]

const MORE_ITEMS = [
  { id: 'sucursales', labelKey: 'nav.branches', icon: Building2, route: ROUTES.BRANCHES },
  { id: 'usuarios',   labelKey: 'nav.users',    icon: Users,     route: ROUTES.USERS    },
  { id: 'wallet',     labelKey: 'nav.wallet',   icon: Wallet,    route: ROUTES.WALLET   },
  { id: 'settings',   labelKey: 'nav.settings', icon: Settings,  route: ROUTES.SETTINGS },
]

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: SPRING },
  exit: { y: '100%', transition: { type: 'spring', stiffness: 400, damping: 36 } },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export default function BottomNav() {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const navigate       = useNavigate()
  const location       = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [hidden, setHidden]       = useState(false)

  const isMoreActive = MORE_ITEMS.some(item => location.pathname === item.route)

  // Hide bottom nav when a modal is open (data-modal-open on body)
  useEffect(() => {
    const check = () => setHidden(document.body.dataset.modalOpen === 'true')
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-modal-open'] })
    return () => observer.disconnect()
  }, [])

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (!sheetOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [sheetOpen])

  const handleNav = (route) => {
    navigate(route)
    setSheetOpen(false)
  }

  return (
    <>
      {/* ── Bottom bar ── */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: hidden ? '100%' : 0 }}
        transition={SPRING}
        className={`fixed bottom-0 inset-x-0 z-40 flex items-stretch justify-around border-t backdrop-blur-2xl backdrop-saturate-150 pb-[env(safe-area-inset-bottom)] ${
        isDarkMode
          ? 'bg-[#111113]/45 border-white/10 border-t-white/15'
          : 'bg-white/50 border-black/5 border-t-white/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
      }`}>
        <LayoutGroup id="bottomnav">
        {TABS.map(({ id, labelKey, icon: Icon, route }) => {
          const isActive = location.pathname === route
          const label = t(labelKey)
          return (
            <button
              key={id}
              onClick={() => handleNav(route)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 pt-3 relative ${
                isActive
                  ? isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'
                  : isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-pill"
                  className={`absolute inset-x-2 inset-y-1.5 rounded-2xl ${
                    isDarkMode
                      ? 'bg-[#7C3AED]/10 border border-[#7C3AED]/20'
                      : 'bg-[#DBD3FB]/40 border border-[#7C3AED]/10'
                  }`}
                  transition={SPRING}
                />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
              <span className={`text-[10px] leading-none relative z-10 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          )
        })}

        {/* More tab */}
        <button
          onClick={() => setSheetOpen(v => !v)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 pt-3 relative ${
            isMoreActive || sheetOpen
              ? isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]'
              : isDarkMode ? 'text-[#888991]' : 'text-[#67656E]'
          }`}
        >
          {isMoreActive && !sheetOpen && (
            <motion.div
              layoutId="bottomnav-pill"
              className={`absolute inset-x-2 inset-y-1.5 rounded-2xl ${
                isDarkMode
                  ? 'bg-[#7C3AED]/10 border border-[#7C3AED]/20'
                  : 'bg-[#DBD3FB]/40 border border-[#7C3AED]/10'
              }`}
              transition={SPRING}
            />
          )}
          <MoreHorizontal size={20} strokeWidth={isMoreActive || sheetOpen ? 2.5 : 2} className="relative z-10" />
          <span className={`text-[10px] leading-none relative z-10 ${isMoreActive || sheetOpen ? 'font-bold' : 'font-medium'}`}>
            {t('nav.moreShort')}
          </span>
        </button>
        </LayoutGroup>
      </motion.nav>

      {/* ── More sheet ── */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="sheet-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            key="sheet-panel"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) setSheetOpen(false)
            }}
            className={`fixed bottom-0 inset-x-0 z-[35] rounded-t-2xl border-t pb-[calc(68px+env(safe-area-inset-bottom))] ${
              isDarkMode
                ? 'bg-[#1A1A1D] border-white/10'
                : 'bg-white border-black/5 shadow-[0_-8px_40px_rgba(0,0,0,0.1)]'
            }`}
          >
            {/* Handle bar */}
            <div className="flex justify-center py-3">
              <div className={`w-10 h-1 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
            </div>

            {/* Sheet header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#111113]'}`}>
                {t('nav.moreOptions')}
              </h3>
              <button
                onClick={() => setSheetOpen(false)}
                className={`w-11 h-11 flex items-center justify-center -mr-2 rounded-xl transition-colors ${
                  isDarkMode ? 'text-[#888991] hover:bg-white/10' : 'text-[#67656E] hover:bg-black/5'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Sheet items */}
            <div className="px-4 grid grid-cols-4 gap-2">
              {MORE_ITEMS.map(({ id, labelKey, icon: Icon, route }) => {
                const isActive = location.pathname === route
                const label = t(labelKey)
                return (
                  <button
                    key={id}
                    onClick={() => handleNav(route)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl transition-colors ${
                      isActive
                        ? isDarkMode
                          ? 'bg-[#7C3AED]/15 text-[#A78BFA]'
                          : 'bg-[#DBD3FB]/40 text-[#7C3AED]'
                        : isDarkMode
                          ? 'text-[#888991] hover:bg-white/5'
                          : 'text-[#67656E] hover:bg-black/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive
                        ? isDarkMode
                          ? 'bg-[#7C3AED]/20'
                          : 'bg-[#7C3AED]/10'
                        : isDarkMode
                          ? 'bg-white/5'
                          : 'bg-black/5'
                    }`}>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[11px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
